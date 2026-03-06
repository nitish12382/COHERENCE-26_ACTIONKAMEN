"""Workflow engine — orchestrates multi-step outreach sequences."""
from datetime import datetime
from typing import List
from backend.models.workflow import WorkflowOut, WorkflowStep
from backend.services.delay_engine import next_send_time
from backend.core.logger import get_logger

logger = get_logger(__name__)


def build_schedule(workflow: WorkflowOut, start_time: datetime | None = None) -> List[dict]:
    """
    Given a workflow, return a schedule list with each step's planned execution time.
    """
    schedule = []
    current_time = start_time or datetime.utcnow()

    for i, step in enumerate(workflow.steps):
        scheduled_at = next_send_time(step, current_time)
        schedule.append(
            {
                "step_index": i,
                "type": step.type,
                "label": step.label,
                "detail": step.detail,
                "scheduled_at": scheduled_at.isoformat(),
            }
        )
        current_time = scheduled_at

    logger.info(
        "Built schedule for workflow '%s' with %d steps", workflow.name, len(schedule)
    )
    return schedule
