from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    type: str  # email | wait | followup | condition
    label: str
    detail: str
    delay_days: Optional[int] = 0


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = ""
    target_audience: Optional[str] = ""
    steps: List[WorkflowStep] = []


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    steps: Optional[List[WorkflowStep]] = None
    status: Optional[str] = None


class WorkflowOut(WorkflowBase):
    id: str
    status: str = "active"
    created_at: datetime
    updated_at: datetime
