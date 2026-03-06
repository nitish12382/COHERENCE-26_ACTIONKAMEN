"""
Seed script — populates the database with sample data for development.
Run with:  python -m backend.scripts.seed
"""
import asyncio
from datetime import datetime
from backend.db.mongodb import connect_db, get_db
from backend.repositories.lead_repo import LeadRepository
from backend.repositories.campaign_repo import CampaignRepository
from backend.repositories.workflow_repo import WorkflowRepository
from backend.models.lead import LeadCreate
from backend.models.campaign import CampaignCreate
from backend.models.workflow import WorkflowCreate, WorkflowStep

SAMPLE_LEADS = [
    LeadCreate(name="John Smith", company="FinTech Corp", email="john@fintechcorp.com", industry="FinTech", location="New York"),
    LeadCreate(name="Sarah Johnson", company="CloudScale AI", email="sarah@cloudscale.ai", industry="AI/ML", location="San Francisco"),
    LeadCreate(name="Mike Chen", company="DataFlow Inc", email="mike@dataflow.io", industry="Data", location="Austin"),
    LeadCreate(name="Emily Davis", company="GrowthPulse", email="emily@growthpulse.com", industry="Marketing", location="Chicago"),
    LeadCreate(name="Alex Rivera", company="SecureNet", email="alex@securenet.com", industry="Cybersecurity", location="Seattle"),
    LeadCreate(name="Lisa Wang", company="PropTech Solutions", email="lisa@proptech.co", industry="Real Estate", location="Miami"),
    LeadCreate(name="David Kim", company="HealthBridge", email="david@healthbridge.io", industry="Healthcare", location="Boston"),
    LeadCreate(name="Rachel Green", company="EduLearn Pro", email="rachel@edulearn.com", industry="EdTech", location="Denver"),
]

SAMPLE_WORKFLOWS = [
    WorkflowCreate(
        name="SaaS Founder Outreach",
        description="5-step sequence for SaaS founders",
        target_audience="SaaS founders",
        steps=[
            WorkflowStep(type="email", label="Send Initial Email", detail="Personalized AI outreach", delay_days=0),
            WorkflowStep(type="wait", label="Wait 2 Days", detail="Pause before follow-up", delay_days=2),
            WorkflowStep(type="followup", label="Send Follow-Up", detail="If no reply received", delay_days=0),
            WorkflowStep(type="wait", label="Wait 3 Days", detail="Final wait period", delay_days=3),
            WorkflowStep(type="condition", label="Check Reply", detail="Stop if replied, else continue", delay_days=0),
        ],
    ),
]

SAMPLE_CAMPAIGNS = [
    {"name": "Q1 SaaS Outreach", "status": "active", "leads": 1200, "sent": 890, "replied": 67, "progress": 74.0},
    {"name": "FinTech Founders", "status": "active", "leads": 800, "sent": 420, "replied": 38, "progress": 53.0},
    {"name": "Enterprise Pilot", "status": "paused", "leads": 350, "sent": 200, "replied": 22, "progress": 57.0},
    {"name": "AI Startup Outreach", "status": "completed", "leads": 500, "sent": 500, "replied": 45, "progress": 100.0},
]


async def seed():
    await connect_db()
    db = get_db()
    lead_repo = LeadRepository(db)
    campaign_repo = CampaignRepository(db)
    workflow_repo = WorkflowRepository(db)

    # Clear collections
    await db["leads"].delete_many({})
    await db["campaigns"].delete_many({})
    await db["workflows"].delete_many({})

    # Seed leads
    count = await lead_repo.bulk_insert(SAMPLE_LEADS)
    # Set varied statuses
    leads = await lead_repo.get_all(limit=100)
    statuses = ["New", "New", "Contacted", "Replied", "Follow-Up Sent", "Contacted", "Contacted", "Replied"]
    from backend.models.lead import LeadUpdate
    for lead, status in zip(leads, statuses):
        await lead_repo.update(lead.id, LeadUpdate(status=status))
    print(f"Seeded {count} leads")

    # Seed campaigns with stats
    for c in SAMPLE_CAMPAIGNS:
        doc = {
            "name": c["name"],
            "workflow_id": None,
            "lead_ids": [],
            "status": c["status"],
            "leads": c["leads"],
            "sent": c["sent"],
            "replied": c["replied"],
            "progress": c["progress"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db["campaigns"].insert_one(doc)
    print(f"Seeded {len(SAMPLE_CAMPAIGNS)} campaigns")

    # Seed workflows
    for wf in SAMPLE_WORKFLOWS:
        await workflow_repo.create(wf)
    print(f"Seeded {len(SAMPLE_WORKFLOWS)} workflows")

    print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
