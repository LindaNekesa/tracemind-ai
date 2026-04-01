from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List
from services.analyzer import analyze_logs
from db import SessionLocal
from models import AnalysisResult

router = APIRouter()


class AnalyzeRequest(BaseModel):
    caseId: str
    logs: List[Any]


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    result = analyze_logs({"logs": req.logs})

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


@router.get("/accuracy")
async def get_accuracy():
    """Aggregate accuracy metrics across all stored analysis results."""
    db = SessionLocal()
    try:
        records = db.query(AnalysisResult).all()
    finally:
        db.close()

    if not records:
        return {"total_analyses": 0, "message": "No analyses found"}

    precisions, recalls, f1s, confidences = [], [], [], []

    for r in records:
        acc = r.result.get("accuracy") if isinstance(r.result, dict) else None
        if not acc:
            continue
        precisions.append(acc.get("overall_precision", 0))
        recalls.append(acc.get("overall_recall", 0))
        f1s.append(acc.get("overall_f1", 0))
        confidences.append(acc.get("overall_confidence", 0))

    def avg(lst: list) -> float:
        return round(sum(lst) / len(lst), 4) if lst else 0.0

    return {
        "total_analyses": len(records),
        "avg_precision": avg(precisions),
        "avg_recall": avg(recalls),
        "avg_f1": avg(f1s),
        "avg_confidence": avg(confidences),
    }
