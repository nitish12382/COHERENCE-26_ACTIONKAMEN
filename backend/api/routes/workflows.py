from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.db.mongodb import get_db
from backend.repositories.workflow_repo import WorkflowRepository
from backend.models.workflow import WorkflowCreate, WorkflowUpdate, WorkflowOut
from backend.services.workflow_engine import build_schedule

router = APIRouter(prefix="/workflows", tags=["workflows"])


def get_repo() -> WorkflowRepository:
    return WorkflowRepository(get_db())


@router.get("", response_model=List[WorkflowOut])
async def list_workflows(repo: WorkflowRepository = Depends(get_repo)):
    return await repo.get_all()


@router.post("", response_model=WorkflowOut, status_code=201)
async def create_workflow(
    data: WorkflowCreate,
    repo: WorkflowRepository = Depends(get_repo),
):
    return await repo.create(data)


@router.get("/{workflow_id}", response_model=WorkflowOut)
async def get_workflow(workflow_id: str, repo: WorkflowRepository = Depends(get_repo)):
    workflow = await repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.patch("/{workflow_id}", response_model=WorkflowOut)
async def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    repo: WorkflowRepository = Depends(get_repo),
):
    workflow = await repo.update(workflow_id, data)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(workflow_id: str, repo: WorkflowRepository = Depends(get_repo)):
    deleted = await repo.delete(workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")


@router.get("/{workflow_id}/schedule")
async def get_schedule(workflow_id: str, repo: WorkflowRepository = Depends(get_repo)):
    workflow = await repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    schedule = build_schedule(workflow)
    return {"workflow_id": workflow_id, "schedule": schedule}
