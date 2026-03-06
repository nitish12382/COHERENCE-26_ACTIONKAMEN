from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends, Form
from typing import Optional, List
from backend.db.mongodb import get_db
from backend.repositories.lead_repo import LeadRepository
from backend.models.lead import LeadCreate, LeadUpdate, LeadOut
from backend.services.excel_parser import parse_csv_or_excel
from backend.services.lead_scorer import score_lead

router = APIRouter(prefix="/leads", tags=["leads"])


def get_repo() -> LeadRepository:
    return LeadRepository(get_db())


# ── /batches and /next-batch must come before /{lead_id} ────────────────────

@router.get("/batches", response_model=list)
async def get_batches(repo: LeadRepository = Depends(get_repo)):
    """Return all distinct batches with their description and lead count."""
    return await repo.get_batches()


@router.get("/next-batch", response_model=dict)
async def get_next_batch(repo: LeadRepository = Depends(get_repo)):
    """Return the next auto-assigned batch name (e.g. batch_3)."""
    batch = await repo.get_next_batch_name()
    return {"batch": batch}


# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=dict, status_code=201)
async def upload_leads(
    file: UploadFile = File(...),
    description: str = Form(""),
    repo: LeadRepository = Depends(get_repo),
):
    """Upload a CSV or Excel file. Batch is auto-assigned server-side."""
    allowed = {
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    content_type = file.content_type or ""
    filename = file.filename or ""
    if content_type not in allowed and not filename.lower().endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    # Auto-assign next batch
    batch = await repo.get_next_batch_name()

    file_bytes = await file.read()
    try:
        leads = parse_csv_or_excel(
            file_bytes, filename,
            batch=batch,
            description=description.strip(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    count = await repo.bulk_insert(leads)
    return {"inserted": count, "batch": batch, "message": f"Successfully imported {count} leads into {batch}"}


# ── List / CRUD ───────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_leads(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    batch: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    repo: LeadRepository = Depends(get_repo),
):
    leads = await repo.get_all(search=search, status=status, batch=batch, skip=skip, limit=limit)
    total = await repo.count(search=search, status=status, batch=batch)
    return {"leads": [l.model_dump() for l in leads], "total": total}


@router.post("", response_model=LeadOut, status_code=201)
async def create_lead(data: LeadCreate, repo: LeadRepository = Depends(get_repo)):
    lead = await repo.create(data)
    score = score_lead(lead.model_dump())
    await repo.update(lead.id, LeadUpdate(score=score))
    lead.score = score
    return lead


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: str, repo: LeadRepository = Depends(get_repo)):
    lead = await repo.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(lead_id: str, data: LeadUpdate, repo: LeadRepository = Depends(get_repo)):
    lead = await repo.update(lead_id, data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: str, repo: LeadRepository = Depends(get_repo)):
    deleted = await repo.delete(lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
