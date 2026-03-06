"""Delay engine — helper to compute next send time based on workflow step delay."""
from datetime import datetime, timedelta
from backend.models.workflow import WorkflowStep


def next_send_time(step: WorkflowStep, from_time: datetime | None = None) -> datetime:
    """Return the datetime when the next step should be executed."""
    base = from_time or datetime.utcnow()
    delay_days = step.delay_days or 0
    return base + timedelta(days=delay_days)
