from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Optional
from services.credibility import assess_credibility

router = APIRouter()


class CredibilityRequest(BaseModel):
    caseId: str
    title: str
    description: str
    status: str
    priority: str
    type: str
    logs: List[Any]
    evidence_count: Optional[int] = 0
    analysis_count: Optional[int] = 0
    risk_score: Optional[int] = 0


@router.post("/credibility")
async def check_credibility(req: CredibilityRequest):
    case = {
        "title":       req.title,
        "description": req.description,
        "status":      req.status,
        "priority":    req.priority,
        "type":        req.type,
        "logs":        req.logs,
    }
    result = assess_credibility(
        case=case,
        evidence_count=req.evidence_count,
        analysis_count=req.analysis_count,
        risk_score=req.risk_score,
    )
    return {**result, "caseId": req.caseId}


@router.post("/credibility/batch")
async def check_credibility_batch(cases: List[CredibilityRequest]):
    """Score multiple cases at once for the admin overview."""
    results = []
    for req in cases:
        case = {
            "title": req.title, "description": req.description,
            "status": req.status, "priority": req.priority,
            "type": req.type, "logs": req.logs,
        }
        result = assess_credibility(
            case=case,
            evidence_count=req.evidence_count,
            analysis_count=req.analysis_count,
            risk_score=req.risk_score,
        )
        results.append({**result, "caseId": req.caseId, "title": req.title})
    return results
