from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _info=None):
        if isinstance(v, ObjectId):
            return str(v)
        if ObjectId.is_valid(str(v)):
            return str(v)
        raise ValueError(f"Invalid ObjectId: {v}")


class LeadBase(BaseModel):
    name: str
    company: str
    email: EmailStr
    industry: Optional[str] = ""
    location: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    website: Optional[str] = ""
    notes: Optional[str] = ""
    batch: Optional[str] = ""
    description: Optional[str] = ""


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    score: Optional[float] = None


class Lead(LeadBase):
    id: Optional[str] = Field(default=None, alias="_id")
    status: str = "New"
    score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


class LeadOut(BaseModel):
    id: str
    name: str
    company: str
    email: str
    industry: Optional[str] = ""
    location: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    website: Optional[str] = ""
    notes: Optional[str] = ""
    batch: Optional[str] = ""
    description: Optional[str] = ""
    status: str
    score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
