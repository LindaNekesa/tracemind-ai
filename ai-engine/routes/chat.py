from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Optional
from services.investigator import investigation_assistant
from services.credibility import assess_credibility

router = APIRouter()


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []
    case: Optional[dict] = None          # case context if provided
    evidence_count: Optional[int] = 0
    analysis_count: Optional[int] = 0
    risk_score: Optional[int] = 0


@router.post("/chat")
async def chat(req: ChatRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    case = req.case or {}
    logs = case.get("logs", [])

    # Build context for the assistant
    context: dict[str, Any] = {
        "insights":        case.get("insights", []),
        "risk_level":      case.get("risk_level", "UNKNOWN"),
        "risk_score":      req.risk_score,
        "attack_patterns": case.get("attack_patterns", []),
        "entities":        case.get("entities", {}),
        "entity_threats":  case.get("entity_threats", {}),
        "timeline":        case.get("timeline", {}),
    }

    # If case has logs, run credibility check for context
    credibility = None
    if logs or case.get("title"):
        credibility = assess_credibility(
            case=case,
            evidence_count=req.evidence_count,
            analysis_count=req.analysis_count,
            risk_score=req.risk_score,
        )

    # Get investigation assistant answer
    answer = investigation_assistant(question, context)

    # Augment answer with credibility if relevant
    q_lower = question.lower()
    if credibility and any(kw in q_lower for kw in
            ("trust", "credib", "real", "fake", "false", "court", "valid", "legit", "reliable")):
        verdict = credibility["verdict"]
        score   = credibility["credibility_score"]
        summary = credibility["summary"]
        answer  = (
            f"**Credibility Assessment:** {verdict} ({score}/100)\n\n"
            f"{summary}\n\n"
            f"**Investigation Insight:** {answer}"
        )

    return {
        "answer": answer,
        "credibility": credibility,
    }
