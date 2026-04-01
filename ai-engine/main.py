from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.investigate import router as investigate_router
from routes.credibility import router as credibility_router
from routes.chat import router as chat_router

app = FastAPI(title="TraceMind AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(investigate_router)
app.include_router(credibility_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "TraceMind AI Engine running"}


@app.get("/health")
def health():
    return {"status": "ok"}
