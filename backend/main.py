from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import settings
from backend.db.mongodb import connect_db, close_db
from backend.core.logger import get_logger
from backend.api.routes import leads, campaigns, workflows, messages, analytics

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="OutreachAI API",
    description="Backend for the OutreachAI sales automation platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
PREFIX = "/api"
app.include_router(leads.router, prefix=PREFIX)
app.include_router(campaigns.router, prefix=PREFIX)
app.include_router(workflows.router, prefix=PREFIX)
app.include_router(messages.router, prefix=PREFIX)
app.include_router(analytics.router, prefix=PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
