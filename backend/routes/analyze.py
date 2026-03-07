from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks, Request
from fastapi.responses import StreamingResponse, JSONResponse
from models.schemas import AnalyzeTextRequest
from services.ai import analyze_chunk_stream, generate_summary, compute_risk_score, run_full_analysis
from services.db import save_analysis, get_history, get_analysis_by_id, delete_analysis
from services.chunker import chunk_text
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
import PyPDF2, io, json, os

load_dotenv()

# ── Router must be defined FIRST before any decorators ───────────────────────
router = APIRouter()


# ── Resend email client (lazy init so .env is loaded first) ──────────────────
def get_resend():
    import resend as _resend
    _resend.api_key = os.getenv("RESEND_API_KEY", "")
    return _resend


# ── SSE helper ───────────────────────────────────────────────────────────────
def event(data: dict) -> str:
    """Format a Server-Sent Event string."""
    return f"data: {json.dumps(data)}\n\n"


# ── Core streaming pipeline ──────────────────────────────────────────────────
async def stream_analysis(text: str, doc_name: str):
    """
    Generator that streams analysis events to the frontend.
    Events: start → progress → clause (per clause) → done
    """
    chunks      = chunk_text(text)
    all_clauses = []

    yield event({"type": "start", "totalChunks": len(chunks), "docName": doc_name})

    for i, chunk in enumerate(chunks):
        yield event({
            "type":  "progress",
            "chunk": i + 1,
            "total": len(chunks),
            "label": f"Analyzing section {i + 1} of {len(chunks)}…"
        })

        result  = analyze_chunk_stream(chunk, i, len(chunks))
        clauses = result.get("clauses", [])

        # Ensure every clause has a unique id
        for j, clause in enumerate(clauses):
            if not clause.get("id"):
                clause["id"] = f"clause-{i}-{j}"

        all_clauses.extend(clauses)

        # Stream each clause immediately so the UI renders it right away
        for clause in clauses:
            yield event({"type": "clause", "clause": clause})

    yield event({
        "type":  "progress",
        "chunk": len(chunks),
        "total": len(chunks),
        "label": "Generating executive summary…"
    })

    summary = generate_summary(all_clauses, doc_name)
    risk    = compute_risk_score(all_clauses)

    # Persist to MongoDB
    record = {
        "docName":    doc_name,
        "clauses":    all_clauses,
        "summary":    summary,
        "riskScore":  risk["score"],
        "riskLabel":  risk["label"],
        "riskColor":  risk["color"],
        "chunkCount": len(chunks),
    }
    doc_id = await save_analysis(record)

    yield event({
        "type":         "done",
        "id":           doc_id,
        "summary":      summary,
        "riskScore":    risk["score"],
        "riskLabel":    risk["label"],
        "riskColor":    risk["color"],
        "chunkCount":   len(chunks),
        "totalClauses": len(all_clauses),
    })


# ── PDF text extractor ───────────────────────────────────────────────────────
def extract_pdf_text(content: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

# ── Analyze: text ─────────────────────────────────────────────────────────────
@router.post("/analyze/text")
async def analyze_text(body: AnalyzeTextRequest):
    if not body.text.strip():
        raise HTTPException(400, "Text cannot be empty")

    return StreamingResponse(
        stream_analysis(body.text, body.docName),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",  # required for Railway/Nginx
        }
    )


# ── Analyze: file upload ──────────────────────────────────────────────────────
@router.post("/analyze/file")
async def analyze_file(
    file:    UploadFile = File(...),
    docName: str        = Form(default=""),
):
    name    = docName or file.filename
    content = await file.read()

    if file.content_type == "application/pdf":
        text = extract_pdf_text(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(400, "Could not extract text from file")

    return StreamingResponse(
        stream_analysis(text, name),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


# ── History: list ─────────────────────────────────────────────────────────────
@router.get("/history")
async def get_all_history():
    data = await get_history()
    return JSONResponse(content=data)


# ── History: single ───────────────────────────────────────────────────────────
@router.get("/history/{doc_id}")
async def get_single(doc_id: str):
    doc = await get_analysis_by_id(doc_id)
    if not doc:
        raise HTTPException(404, "Analysis not found")
    return JSONResponse(content=doc)


# ── History: delete ───────────────────────────────────────────────────────────
@router.delete("/history/{doc_id}")
async def delete_single(doc_id: str):
    success = await delete_analysis(doc_id)
    if not success:
        raise HTTPException(404, "Analysis not found")
    return {"deleted": True}


# ── Dashboard stats ───────────────────────────────────────────────────────────
@router.get("/dashboard/stats")
async def get_stats():
    """Aggregate risk stats across all stored analyses."""
    docs = await get_history(limit=100)

    if not docs:
        return JSONResponse(content={
            "totalDocs":        0,
            "totalClauses":     0,
            "avgRiskScore":     0,
            "categoryBreakdown": {},
            "riskDistribution": {"High": 0, "Medium": 0, "Low": 0},
            "recentDocs":       [],
        })

    total_clauses   = sum(len(d.get("clauses", [])) for d in docs)
    avg_score       = round(sum(d.get("riskScore", 0) for d in docs) / len(docs))
    risk_dist       = {"High": 0, "Medium": 0, "Low": 0}
    category_counts = {}

    for doc in docs:
        for clause in doc.get("clauses", []):
            lvl = clause.get("riskLevel", "Low")
            cat = clause.get("category", "Other")
            risk_dist[lvl]     = risk_dist.get(lvl, 0) + 1
            category_counts[cat] = category_counts.get(cat, 0) + 1

    # Return top 5 categories by frequency
    top_cats = dict(
        sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    )

    return JSONResponse(content={
        "totalDocs":         len(docs),
        "totalClauses":      total_clauses,
        "avgRiskScore":      avg_score,
        "riskDistribution":  risk_dist,
        "categoryBreakdown": top_cats,
        "recentDocs":        docs[:5],
    })


# ── Document comparison ───────────────────────────────────────────────────────
class CompareRequest(BaseModel):
    text1: str
    name1: str = "Document A"
    text2: str
    name2: str = "Document B"


@router.post("/compare")
async def compare_documents(body: CompareRequest):
    """
    Analyze two documents independently and return a side-by-side comparison.
    Uses run_full_analysis (non-streaming) so both results are ready together.
    """
    if not body.text1.strip() or not body.text2.strip():
        raise HTTPException(400, "Both documents must have text")

    result1 = run_full_analysis(body.text1, body.name1)
    result2 = run_full_analysis(body.text2, body.name2)

    risk_diff   = result1["riskScore"] - result2["riskScore"]
    clause_diff = len(result1["clauses"]) - len(result2["clauses"])

    # Lower score = safer document
    winner = body.name1 if result1["riskScore"] <= result2["riskScore"] else body.name2

    return JSONResponse(content={
        "doc1": {**result1, "docName": body.name1},
        "doc2": {**result2, "docName": body.name2},
        "comparison": {
            "riskDiff":    risk_diff,
            "clauseDiff":  clause_diff,
            "winner":      winner,
            "winnerLabel": "Lower Risk Document",
        }
    })


# ── Email report ──────────────────────────────────────────────────────────────
@router.post("/email-report/{doc_id}")
async def email_report(
    doc_id:           str,
    background_tasks: BackgroundTasks,
    email:            str = Form(...),
):
    """Send a formatted HTML risk report to the provided email address."""
    if not email or "@" not in email:
        raise HTTPException(400, "Invalid email address")

    doc = await get_analysis_by_id(doc_id)
    if not doc:
        raise HTTPException(404, "Analysis not found")

    if not os.getenv("RESEND_API_KEY"):
        raise HTTPException(503, "Email service not configured")

    # Run in background so API responds immediately
    background_tasks.add_task(send_report_email, email, doc)
    return {"message": f"Report is being sent to {email}"}


def send_report_email(to_email: str, doc: dict):
    """Build and send a rich HTML email report via Resend."""
    resend = get_resend()

    clauses = doc.get("clauses", [])
    high    = sum(1 for c in clauses if c.get("riskLevel") == "High")
    medium  = sum(1 for c in clauses if c.get("riskLevel") == "Medium")
    low     = sum(1 for c in clauses if c.get("riskLevel") == "Low")

    # Sort by risk level before slicing top 10
    order   = {"High": 0, "Medium": 1, "Low": 2}
    sorted_clauses = sorted(clauses, key=lambda c: order.get(c.get("riskLevel", "Low"), 3))

    clause_rows = ""
    for c in sorted_clauses[:10]:
        color = {"High": "#dc2626", "Medium": "#f59e0b", "Low": "#22c55e"}.get(
            c.get("riskLevel", "Low"), "#64748b"
        )
        original = c.get("originalText", "")[:120]
        clause_rows += f"""
        <tr>
          <td style="padding:10px;border-bottom:1px solid #f1f5f9;vertical-align:top">
            <span style="background:{color};color:white;padding:2px 8px;
                         border-radius:100px;font-size:11px;font-weight:700;
                         white-space:nowrap">
              {c.get("riskLevel","")}
            </span>
          </td>
          <td style="padding:10px;border-bottom:1px solid #f1f5f9;
                     font-size:12px;color:#374151;vertical-align:top;
                     white-space:nowrap">
            {c.get("category","")}
          </td>
          <td style="padding:10px;border-bottom:1px solid #f1f5f9;
                     font-size:12px;color:#6b7280;font-style:italic;
                     vertical-align:top">
            "{original}{"…" if len(c.get("originalText","")) > 120 else ""}"
          </td>
        </tr>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:20px;background:#f1f5f9">
    <div style="font-family:system-ui,sans-serif;max-width:620px;
                margin:0 auto;border-radius:20px;overflow:hidden;
                box-shadow:0 4px 24px rgba(0,0,0,0.1)">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                  padding:36px 32px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">⚖️</div>
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800">
          ClauseGuard
        </h1>
        <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px">
          AI Contract Risk Analysis Report
        </p>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:32px">

        <h2 style="color:#1e293b;margin:0 0 4px;font-size:18px">
          {doc.get("docName", "Document")}
        </h2>
        <p style="color:#94a3b8;font-size:12px;margin:0 0 28px">
          Analyzed on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}
        </p>

        <!-- Risk score -->
        <div style="text-align:center;padding:28px;background:#f8fafc;
                    border-radius:16px;margin-bottom:24px;
                    border:1px solid #e2e8f0">
          <div style="font-size:52px;font-weight:800;line-height:1;
                      color:{doc.get('riskColor','#64748b')}">
            {doc.get("riskScore", 0)}
          </div>
          <div style="font-weight:700;font-size:16px;margin-top:6px;
                      color:{doc.get('riskColor','#64748b')}">
            {doc.get("riskLabel", "")}
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:4px;
                      text-transform:uppercase;letter-spacing:0.08em">
            Overall Risk Score
          </div>
        </div>

        <!-- Counts -->
        <div style="display:flex;gap:12px;margin-bottom:28px">
          <div style="flex:1;padding:16px;background:#fef2f2;
                      border-radius:12px;text-align:center;
                      border:1px solid #fecaca">
            <div style="font-size:28px;font-weight:800;color:#dc2626">{high}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px">High Risk</div>
          </div>
          <div style="flex:1;padding:16px;background:#fffbeb;
                      border-radius:12px;text-align:center;
                      border:1px solid #fcd34d">
            <div style="font-size:28px;font-weight:800;color:#f59e0b">{medium}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px">Medium Risk</div>
          </div>
          <div style="flex:1;padding:16px;background:#f0fdf4;
                      border-radius:12px;text-align:center;
                      border:1px solid #86efac">
            <div style="font-size:28px;font-weight:800;color:#22c55e">{low}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px">Low Risk</div>
          </div>
        </div>

        <!-- Executive summary -->
        <h3 style="color:#1e293b;margin:0 0 10px;font-size:14px;
                   text-transform:uppercase;letter-spacing:0.06em">
          Executive Summary
        </h3>
        <p style="color:#475569;font-size:14px;line-height:1.7;
                  margin:0 0 28px;padding:16px;background:#f8fafc;
                  border-radius:10px;border-left:3px solid #6366f1">
          {doc.get("summary", "")}
        </p>

        <!-- Top clauses table -->
        <h3 style="color:#1e293b;margin:0 0 12px;font-size:14px;
                   text-transform:uppercase;letter-spacing:0.06em">
          Top Risk Clauses
          <span style="font-weight:400;color:#94a3b8;font-size:12px;
                       text-transform:none;letter-spacing:0">
            (showing {min(10,len(clauses))} of {len(clauses)})
          </span>
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:10px;text-align:left;font-size:11px;
                         color:#94a3b8;font-weight:700;letter-spacing:0.06em;
                         border-bottom:2px solid #e2e8f0">RISK</th>
              <th style="padding:10px;text-align:left;font-size:11px;
                         color:#94a3b8;font-weight:700;letter-spacing:0.06em;
                         border-bottom:2px solid #e2e8f0">CATEGORY</th>
              <th style="padding:10px;text-align:left;font-size:11px;
                         color:#94a3b8;font-weight:700;letter-spacing:0.06em;
                         border-bottom:2px solid #e2e8f0">CLAUSE</th>
            </tr>
          </thead>
          <tbody>{clause_rows}</tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:20px 32px;text-align:center;
                  border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:12px;margin:0">
          Generated by <strong>ClauseGuard</strong> · AI Contract Risk Analyzer
          <br/>
          <span style="font-size:11px">
            This report is for informational purposes only and does not constitute legal advice.
          </span>
        </p>
      </div>

    </div>
    </body>
    </html>"""

    try:
        resend.Emails.send({
            "from":    os.getenv("FROM_EMAIL", "onboarding@resend.dev"),
            "to":      [to_email],
            "subject": f"⚖️ Risk Report: {doc.get('docName','')} — Score {doc.get('riskScore',0)}/100",
            "html":    html,
        })
    except Exception as e:
        print(f"Email send failed: {e}")