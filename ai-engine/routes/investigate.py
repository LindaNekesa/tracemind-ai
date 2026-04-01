from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Optional
from services.investigator import investigate
from db import SessionLocal
from models import AnalysisResult

router = APIRouter()


class InvestigateRequest(BaseModel):
    caseId: str
    logs: List[Any]
    question: Optional[str] = None


@router.post("/investigate")
async def run_investigation(req: InvestigateRequest):
    result = investigate({"logs": req.logs, "question": req.question})

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    db = SessionLocal()
    try:
        record = AnalysisResult(caseId=req.caseId, result=result)
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")
    finally:
        db.close()

    return {**result, "id": record.id, "caseId": record.caseId}


class AskRequest(BaseModel):
    caseId: str
    question: str
    context: dict


@router.post("/investigate/ask")
async def ask_assistant(req: AskRequest):
    """Ask the investigation assistant a question about an existing analysis."""
    from services.investigator import investigation_assistant
    answer = investigation_assistant(req.question, req.context)
    return {"answer": answer, "caseId": req.caseId}
