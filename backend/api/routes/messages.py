from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from backend.db.mongodb import get_db
from backend.repositories.message_repo import MessageRepository
from backend.models.message import MessageRequest, MessageOut
from backend.services.groq_service import generate_message
from backend.config import settings

router = APIRouter(prefix="/messages", tags=["messages"])


def get_repo() -> MessageRepository:
    return MessageRepository(get_db())


@router.post("/generate", response_model=MessageOut)
async def generate_ai_message(
    req: MessageRequest,
    repo: MessageRepository = Depends(get_repo),
):
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env",
        )
    try:
        message_text = await generate_message(
            prompt=req.prompt,
            tone=req.tone,
            goal=req.goal,
            lead_name=req.lead_name,
            company=req.company,
            industry=req.industry,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq API error: {exc}")

    await repo.save(
        message=message_text,
        tone=req.tone,
        goal=req.goal,
        prompt=req.prompt,
    )

    return MessageOut(
        message=message_text,
        tone=req.tone,
        goal=req.goal,
        generated_at=datetime.utcnow(),
    )


@router.get("/recent")
async def recent_messages(limit: int = 10, repo: MessageRepository = Depends(get_repo)):
    return await repo.recent(limit=limit)
