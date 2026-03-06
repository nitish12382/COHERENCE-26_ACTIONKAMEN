from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.campaign import CampaignCreate, CampaignUpdate, CampaignOut


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class CampaignRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["campaigns"]

    async def create(self, data: CampaignCreate) -> CampaignOut:
        doc = data.model_dump()
        doc["status"] = "active"
        doc["sent"] = 0
        doc["replied"] = 0
        doc["leads"] = len(doc.get("lead_ids", []))
        doc["progress"] = 0.0
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()
        result = await self.col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return CampaignOut(**_serialize(doc))

    async def get_all(self) -> List[CampaignOut]:
        cursor = self.col.find({}).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
        return [CampaignOut(**_serialize(d)) for d in docs]

    async def get_by_id(self, campaign_id: str) -> Optional[CampaignOut]:
        doc = await self.col.find_one({"_id": ObjectId(campaign_id)})
        if not doc:
            return None
        return CampaignOut(**_serialize(doc))

    async def update(self, campaign_id: str, data: CampaignUpdate) -> Optional[CampaignOut]:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        await self.col.update_one({"_id": ObjectId(campaign_id)}, {"$set": update_data})
        return await self.get_by_id(campaign_id)

    async def set_status(self, campaign_id: str, status: str) -> Optional[CampaignOut]:
        await self.col.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}},
        )
        return await self.get_by_id(campaign_id)

    async def delete(self, campaign_id: str) -> bool:
        result = await self.col.delete_one({"_id": ObjectId(campaign_id)})
        return result.deleted_count > 0

    async def active_count(self) -> int:
        return await self.col.count_documents({"status": "active"})

    async def total_count(self) -> int:
        return await self.col.count_documents({})
