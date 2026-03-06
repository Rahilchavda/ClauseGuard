from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
from models.schemas import AnalyzeTextRequest
from services.ai import analyze_chunk_stream, generate_summary, compute_risk_score
from services.db import save_analysis, get_history, get_analysis_by_id, delete_analysis
from services.chunker import chunk_text
import PyPDF2, io, json
from pydantic import BaseModel

router = APIRouter()


def event(data: dict) -> str:
    """Format a Server-Sent Event string."""
    return f"data: {json.dumps(data)}\n\n"


async def stream_analysis(text: str, doc_name: str):
    """
    Generator that streams analysis events to the frontend.
    Each event is a JSON object the frontend can react to immediately.
    """
    chunks      = chunk_text(text)
    all_clauses = []

    # Tell frontend how many chunks to expect
    yield event({"type": "start", "totalChunks": len(chunks), "docName": doc_name})

    for i, chunk in enumerate(chunks):
        # Tell frontend which chunk we're on
        yield event({"type": "progress", "chunk": i + 1, "total": len(chunks),
                     "label": f"Analyzing section {i+1} of {len(chunks)}…"})

        # Analyze this chunk
        result    = analyze_chunk_stream(chunk, i, len(chunks))
        clauses   = result.get("clauses", [])

        # Add unique IDs
        for j, clause in enumerate(clauses):
            if not clause.get("id"):
                clause["id"] = f"clause-{i}-{j}"

        all_clauses.extend(clauses)

        # Stream each clause individually so UI can render immediately
        for clause in clauses:
            yield event({"type": "clause", "clause": clause})

    # Generate summary after all chunks done
    yield event({"type": "progress", "chunk": len(chunks), "total": len(chunks),
                 "label": "Generating executive summary…"})

    summary = generate_summary(all_clauses, doc_name)
    risk    = compute_risk_score(all_clauses)

    # Save to MongoDB
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

    # Final event with complete results
    yield event({
        "type":       "done",
        "id":         doc_id,
        "summary":    summary,
        "riskScore":  risk["score"],
        "riskLabel":  risk["label"],
        "riskColor":  risk["color"],
        "chunkCount": len(chunks),
        "totalClauses": len(all_clauses),
    })


@router.post("/analyze/text")
async def analyze_text(body: AnalyzeTextRequest):
    if not body.text.strip():
        raise HTTPException(400, "Text cannot be empty")
    return StreamingResponse(
        stream_analysis(body.text, body.docName),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # important for Nginx/Railway
        }
    )


@router.post("/analyze/file")
async def analyze_file(
    file: UploadFile = File(...),
    docName: str = Form(default="")
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


@router.get("/history")
async def get_all_history():
    data = await get_history()
    return JSONResponse(content=data)


@router.get("/history/{doc_id}")
async def get_single(doc_id: str):
    doc = await get_analysis_by_id(doc_id)
    if not doc:
        raise HTTPException(404, "Analysis not found")
    return JSONResponse(content=doc)


@router.delete("/history/{doc_id}")
async def delete_single(doc_id: str):
    success = await delete_analysis(doc_id)
    if not success:
        raise HTTPException(404, "Analysis not found")
    return {"deleted": True}


def extract_pdf_text(content: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)

@router.get("/dashboard/stats")
async def get_stats():
    """Aggregate stats across all analyses."""
    docs = await get_history(limit=100)
    if not docs:
        return {
            "totalDocs": 0, "totalClauses": 0,
            "avgRiskScore": 0, "categoryBreakdown": {},
            "riskDistribution": {"High": 0, "Medium": 0, "Low": 0},
            "recentDocs": []
        }

    total_clauses    = sum(len(d.get("clauses", [])) for d in docs)
    avg_score        = round(sum(d.get("riskScore", 0) for d in docs) / len(docs))
    risk_dist        = {"High": 0, "Medium": 0, "Low": 0}
    category_counts  = {}

    for doc in docs:
        for clause in doc.get("clauses", []):
            lvl = clause.get("riskLevel", "Low")
            cat = clause.get("category", "Other")
            risk_dist[lvl]              = risk_dist.get(lvl, 0) + 1
            category_counts[cat]        = category_counts.get(cat, 0) + 1

    # Top 5 categories
    top_cats = dict(sorted(category_counts.items(),
                           key=lambda x: x[1], reverse=True)[:5])

    return {
        "totalDocs":          len(docs),
        "totalClauses":       total_clauses,
        "avgRiskScore":       avg_score,
        "riskDistribution":   risk_dist,
        "categoryBreakdown":  top_cats,
        "recentDocs":         docs[:5],
    }

class CompareRequest(BaseModel):
    text1: str
    name1: str = "Document A"
    text2: str
    name2: str = "Document B"

@router.post("/compare")
async def compare_documents(body: CompareRequest):
    """Analyze two documents and return side-by-side comparison."""
    result1 = run_full_analysis(body.text1, body.name1)
    result2 = run_full_analysis(body.text2, body.name2)

    return JSONResponse(content={
        "doc1": { **result1, "docName": body.name1 },
        "doc2": { **result2, "docName": body.name2 },
        "comparison": {
            "riskDiff":    result1["riskScore"] - result2["riskScore"],
            "clauseDiff":  len(result1["clauses"]) - len(result2["clauses"]),
            "winner":      body.name1 if result1["riskScore"] < result2["riskScore"]
                           else body.name2,
            "winnerLabel": "Lower Risk"
        }
    })