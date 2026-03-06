from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MessageRequest(BaseModel):
    prompt: str
    tone: str = "professional"  # friendly | professional | persuasive
    goal: str = "book-meeting"  # book-meeting | product-intro | demo
    lead_name: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None


class MessageOut(BaseModel):
    message: str
    tone: str
    goal: str
    generated_at: datetime
