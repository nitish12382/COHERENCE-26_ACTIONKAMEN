from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.db.mongodb import get_db
from backend.repositories.campaign_repo import CampaignRepository
from backend.models.campaign import CampaignCreate, CampaignUpdate, CampaignOut

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def get_repo() -> CampaignRepository:
    return CampaignRepository(get_db())


@router.get("", response_model=List[CampaignOut])
async def list_campaigns(repo: CampaignRepository = Depends(get_repo)):
    return await repo.get_all()


@router.post("", response_model=CampaignOut, status_code=201)
async def create_campaign(
    data: CampaignCreate,
    repo: CampaignRepository = Depends(get_repo),
):
    return await repo.create(data)


@router.get("/{campaign_id}", response_model=CampaignOut)
async def get_campaign(campaign_id: str, repo: CampaignRepository = Depends(get_repo)):
    campaign = await repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/{campaign_id}", response_model=CampaignOut)
async def update_campaign(
    campaign_id: str,
    data: CampaignUpdate,
    repo: CampaignRepository = Depends(get_repo),
):
    campaign = await repo.update(campaign_id, data)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/{campaign_id}/pause", response_model=CampaignOut)
async def pause_campaign(campaign_id: str, repo: CampaignRepository = Depends(get_repo)):
    campaign = await repo.set_status(campaign_id, "paused")
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/{campaign_id}/resume", response_model=CampaignOut)
async def resume_campaign(campaign_id: str, repo: CampaignRepository = Depends(get_repo)):
    campaign = await repo.set_status(campaign_id, "active")
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/{campaign_id}/stop", response_model=CampaignOut)
async def stop_campaign(campaign_id: str, repo: CampaignRepository = Depends(get_repo)):
    campaign = await repo.set_status(campaign_id, "completed")
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(campaign_id: str, repo: CampaignRepository = Depends(get_repo)):
    deleted = await repo.delete(campaign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Campaign not found")
