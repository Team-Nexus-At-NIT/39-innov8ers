from fastapi import FastAPI
from app.api.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title = "Agriculture AI Chatbot Backend",
    description = "Backend API for an AI-powered agriculture chatbot",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allows all origins (good for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return{
        "message" : "Agriculture AI Chatbot Backend is running "
    }
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "backend",
        "version": "1.0.0"
    }  