from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.lead import LeadCreate, LeadUpdate, LeadOut


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class LeadRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["leads"]

    async def create(self, data: LeadCreate) -> LeadOut:
        doc = data.model_dump()
        doc["status"] = "New"
        doc["score"] = None
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()
        result = await self.col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return LeadOut(**_serialize(doc))

    async def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        batch: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[LeadOut]:
        query: dict = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        if status and status != "all":
            query["status"] = status
        if batch:
            query["batch"] = batch
        cursor = self.col.find(query).skip(skip).limit(limit).sort("created_at", -1)
        docs = await cursor.to_list(length=limit)
        return [LeadOut(**_serialize(d)) for d in docs]

    async def count(self, search: Optional[str] = None, status: Optional[str] = None, batch: Optional[str] = None) -> int:
        query: dict = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        if status and status != "all":
            query["status"] = status
        if batch:
            query["batch"] = batch
        return await self.col.count_documents(query)

    async def get_by_id(self, lead_id: str) -> Optional[LeadOut]:
        doc = await self.col.find_one({"_id": ObjectId(lead_id)})
        if not doc:
            return None
        return LeadOut(**_serialize(doc))

    async def update(self, lead_id: str, data: LeadUpdate) -> Optional[LeadOut]:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        await self.col.update_one({"_id": ObjectId(lead_id)}, {"$set": update_data})
        return await self.get_by_id(lead_id)

    async def delete(self, lead_id: str) -> bool:
        result = await self.col.delete_one({"_id": ObjectId(lead_id)})
        return result.deleted_count > 0

    async def bulk_insert(self, leads: List[LeadCreate]) -> int:
        now = datetime.utcnow()
        docs = []
        for lead in leads:
            doc = lead.model_dump()
            doc["status"] = "New"
            doc["score"] = None
            doc["created_at"] = now
            doc["updated_at"] = now
            docs.append(doc)
        if not docs:
            return 0
        result = await self.col.insert_many(docs)
        return len(result.inserted_ids)

    async def status_counts(self) -> dict:
        pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
        result = {}
        async for doc in self.col.aggregate(pipeline):
            result[doc["_id"]] = doc["count"]
        return result

    async def total_count(self) -> int:
        return await self.col.count_documents({})

    async def get_next_batch_name(self) -> str:
        """Auto-determines the next batch name: batch_1, batch_2, ..."""
        pipeline = [
            {"$match": {"batch": {"$exists": True, "$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$batch"}},
        ]
        max_num = 0
        async for doc in self.col.aggregate(pipeline):
            try:
                num = int(str(doc["_id"]).split("_")[-1])
                if num > max_num:
                    max_num = num
            except (ValueError, IndexError):
                pass
        return f"batch_{max_num + 1}"

    async def get_batches(self) -> list:
        """Returns each distinct batch with its description and lead count."""
        pipeline = [
            {"$match": {"batch": {"$exists": True, "$ne": None, "$ne": ""}}},
            {"$group": {
                "_id": "$batch",
                "description": {"$first": "$description"},
                "count": {"$sum": 1},
            }},
            {"$sort": {"_id": 1}},
        ]
        result = []
        async for doc in self.col.aggregate(pipeline):
            result.append({
                "batch": doc["_id"],
                "description": doc.get("description") or "",
                "count": doc["count"],
            })
        return result
