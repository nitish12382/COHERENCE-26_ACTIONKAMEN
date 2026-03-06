"""
Throttle service — enforces a max emails-per-hour limit.
Simple in-memory implementation (resets on server restart).
For production, replace with a Redis-backed sliding window.
"""
import time
from collections import deque
from backend.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

_sent_timestamps: deque = deque()


def can_send() -> bool:
    now = time.time()
    window = settings.THROTTLE_WINDOW
    # Remove timestamps older than the window
    while _sent_timestamps and _sent_timestamps[0] < now - window:
        _sent_timestamps.popleft()
    return len(_sent_timestamps) < settings.THROTTLE_RATE


def record_send() -> None:
    _sent_timestamps.append(time.time())


def remaining_quota() -> int:
    now = time.time()
    window = settings.THROTTLE_WINDOW
    while _sent_timestamps and _sent_timestamps[0] < now - window:
        _sent_timestamps.popleft()
    return max(0, settings.THROTTLE_RATE - len(_sent_timestamps))
