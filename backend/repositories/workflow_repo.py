from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.workflow import WorkflowCreate, WorkflowUpdate, WorkflowOut


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class WorkflowRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["workflows"]

    async def create(self, data: WorkflowCreate) -> WorkflowOut:
        doc = data.model_dump()
        doc["status"] = "active"
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()
        result = await self.col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return WorkflowOut(**_serialize(doc))

    async def get_all(self) -> List[WorkflowOut]:
        cursor = self.col.find({}).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
        return [WorkflowOut(**_serialize(d)) for d in docs]

    async def get_by_id(self, workflow_id: str) -> Optional[WorkflowOut]:
        doc = await self.col.find_one({"_id": ObjectId(workflow_id)})
        if not doc:
            return None
        return WorkflowOut(**_serialize(doc))

    async def update(self, workflow_id: str, data: WorkflowUpdate) -> Optional[WorkflowOut]:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        await self.col.update_one({"_id": ObjectId(workflow_id)}, {"$set": update_data})
        return await self.get_by_id(workflow_id)

    async def delete(self, workflow_id: str) -> bool:
        result = await self.col.delete_one({"_id": ObjectId(workflow_id)})
        return result.deleted_count > 0
