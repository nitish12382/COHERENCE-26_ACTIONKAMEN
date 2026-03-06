from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CampaignBase(BaseModel):
    name: str
    workflow_id: Optional[str] = None
    lead_ids: List[str] = []


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    lead_ids: Optional[List[str]] = None


class CampaignOut(BaseModel):
    id: str
    name: str
    workflow_id: Optional[str] = None
    lead_ids: List[str] = []
    status: str  # active | paused | completed
    leads: int = 0
    sent: int = 0
    replied: int = 0
    progress: float = 0.0
    created_at: datetime
    updated_at: datetime
