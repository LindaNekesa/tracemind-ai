from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class AnalysisResult(Base):
    __tablename__ = "AnalysisResult"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    caseId = Column(String)
    result = Column(JSON)
    createdAt = Column(DateTime, default=datetime.utcnow)