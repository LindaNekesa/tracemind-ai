
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow requests from your Next.js frontend
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class AnalysisRequest(BaseModel):
    text: str

# Response model
class AnalysisResponse(BaseModel):
    sentiment: str
    score: float

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    # Example AI logic
    if "good" in request.text.lower():
        return {"sentiment": "positive", "score": 0.95}
    return {"sentiment": "negative", "score": 0.2}
