from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    location: Optional[str] = None
    
class ChatResponse(BaseModel):
    reply: str
    confidence: float
    status: str