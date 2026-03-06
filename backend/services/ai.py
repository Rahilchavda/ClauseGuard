import os, json, re
from dotenv import load_dotenv
from groq import Groq
from services.chunker import chunk_text

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a legal risk analysis AI that analyzes contracts and policies.

You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no code blocks.

The JSON must follow this exact structure:
{
  "clauses": [
    {
      "id": "clause-1",
      "originalText": "exact quote from the document",
      "riskLevel": "High",
      "category": "Liability",
      "reasoning": "This is risky because...",
      "suggestedWording": "Better version of this clause...",
      "ambiguous": false
    }
  ],
  "summary": "Overall summary of this section"
}

riskLevel must be exactly one of: High, Medium, Low
category must be exactly one of: Liability, Indemnification, Data Privacy, IP Rights, Termination, Payment, Confidentiality, Dispute Resolution, Ambiguous Language, Compliance, Other
ambiguous must be true or false

Find ALL risky clauses. Aim to find at least 3-5 clauses per section.
Do NOT return empty clauses array. Always find something to flag.
RETURN ONLY JSON. NO OTHER TEXT."""


def extract_json(text: str) -> dict:
    """Try multiple strategies to extract valid JSON from response."""
    
    # Strategy 1: Direct parse
    try:
        return json.loads(text.strip())
    except:
        pass

    # Strategy 2: Strip markdown fences
    try:
        clean = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean)
    except:
        pass

    # Strategy 3: Find JSON object in text
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass

    # Strategy 4: Return empty structure
    print(f"WARNING: Could not parse JSON from response: {text[:200]}")
    return {"clauses": [], "summary": "Could not parse response"}


def analyze_chunk(chunk: str, index: int, total: int) -> dict:
    """Send one chunk to Groq and get structured clause analysis."""

    print(f"\n--- Analyzing chunk {index+1}/{total} ---")
    print(f"Chunk preview: {chunk[:100]}...")

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Analyze this contract section and find all risky clauses.
Section {index+1} of {total}:

{chunk}

Remember: Return ONLY a JSON object with clauses array and summary. Find at least 3-5 risky clauses."""
            }
        ],
        temperature=0.1,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content
    print(f"Raw response preview: {raw[:300]}")

    result = extract_json(raw)
    print(f"Parsed clauses count: {len(result.get('clauses', []))}")

    return result


def generate_summary(clauses: list, doc_name: str) -> str:
    """Generate executive summary from all clauses."""

    if not clauses:
        return "No risky clauses were identified in this document."

    high   = sum(1 for c in clauses if c.get("riskLevel") == "High")
    med    = sum(1 for c in clauses if c.get("riskLevel") == "Medium")
    low    = sum(1 for c in clauses if c.get("riskLevel") == "Low")
    cats   = list(set(c.get("category", "") for c in clauses))

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": f"""Write a 3-4 sentence executive summary for a business stakeholder.

Document: "{doc_name}"
Found: {high} high-risk, {med} medium-risk, {low} low-risk clauses
Categories: {", ".join(cats)}

Start with the overall risk posture.
Be direct and specific.
No markdown, no bullet points, plain text only."""
        }],
        temperature=0.3,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()


def compute_risk_score(clauses: list) -> dict:
    """Weighted score: High=10, Medium=4, Low=1"""

    if not clauses:
        return {"score": 0, "label": "Unknown", "color": "#64748b"}

    weights = {"High": 10, "Medium": 4, "Low": 1}
    total   = sum(weights.get(c.get("riskLevel", "Low"), 1) for c in clauses)
    maximum = len(clauses) * 10
    pct     = round((total / maximum) * 100)

    if pct >= 60:
        return {"score": pct, "label": "High Risk",     "color": "#ef4444"}
    if pct >= 30:
        return {"score": pct, "label": "Moderate Risk", "color": "#f59e0b"}
    return     {"score": pct, "label": "Low Risk",      "color": "#22c55e"}


def run_full_analysis(text: str, doc_name: str) -> dict:
    """Full pipeline: chunk → analyze → summarize → score"""

    print(f"\n=== Starting analysis of '{doc_name}' ===")
    print(f"Total text length: {len(text)} chars")

    chunks      = chunk_text(text)
    all_clauses = []

    print(f"Split into {len(chunks)} chunks")

    for i, chunk in enumerate(chunks):
        result = analyze_chunk(chunk, i, len(chunks))
        clauses = result.get("clauses", [])

        # Add unique IDs if missing
        for j, clause in enumerate(clauses):
            if not clause.get("id"):
                clause["id"] = f"clause-{i}-{j}"

        all_clauses.extend(clauses)
        print(f"Chunk {i+1}: found {len(clauses)} clauses")

    print(f"\nTotal clauses found: {len(all_clauses)}")

    summary = generate_summary(all_clauses, doc_name)
    risk    = compute_risk_score(all_clauses)

    return {
        "clauses":    all_clauses,
        "summary":    summary,
        "riskScore":  risk["score"],
        "riskLabel":  risk["label"],
        "riskColor":  risk["color"],
        "chunkCount": len(chunks),
    }
def analyze_chunk_stream(chunk: str, index: int, total: int) -> dict:
    """Same as analyze_chunk but named clearly for streaming route."""
    return analyze_chunk(chunk, index, total)
