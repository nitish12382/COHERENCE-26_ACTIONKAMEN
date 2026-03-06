from datetime import datetime
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase


class MessageRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["messages"]

    async def save(self, message: str, tone: str, goal: str, prompt: str) -> dict:
        doc = {
            "message": message,
            "tone": tone,
            "goal": goal,
            "prompt": prompt,
            "generated_at": datetime.utcnow(),
        }
        result = await self.col.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    async def recent(self, limit: int = 10) -> List[dict]:
        cursor = self.col.find({}).sort("generated_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d["id"] = str(d.pop("_id"))
        return docs

    async def total_count(self) -> int:
        return await self.col.count_documents({})
