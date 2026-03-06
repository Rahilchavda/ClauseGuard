from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# What a single risky clause looks like
class Clause(BaseModel):
    id: str
    originalText: str
    riskLevel: str          # "High" | "Medium" | "Low"
    category: str
    reasoning: str
    suggestedWording: str
    ambiguous: bool

# What the AI returns per chunk
class ChunkResult(BaseModel):
    clauses: List[Clause]
    summary: Optional[str] = ""

# Full analysis stored in MongoDB
class AnalysisRecord(BaseModel):
    docName: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    clauses: List[Clause]
    summary: str
    riskScore: int
    riskLabel: str
    riskColor: str
    chunkCount: int

# What the frontend sends when uploading text
class AnalyzeTextRequest(BaseModel):
    text: str
    docName: str = "Untitled Document"