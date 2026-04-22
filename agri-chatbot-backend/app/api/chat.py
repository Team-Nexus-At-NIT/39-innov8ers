from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    result = chat_service.get_reply(
        message=request.message,
        language=request.language
    )
    
    print("Result from ChatService:", result)
    
    return ChatResponse(
        reply=result["reply"],
        confidence=result["confidence"],
        status="success"
    )
