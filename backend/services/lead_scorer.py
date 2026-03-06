"""Simple lead scorer based on completeness of profile data."""


def score_lead(lead_data: dict) -> float:
    """
    Returns a score from 0-100 based on how complete and strong a lead profile is.
    """
    score = 0.0

    # Required fields (present = 20 pts each)
    if lead_data.get("email"):
        score += 20
    if lead_data.get("company"):
        score += 20
    if lead_data.get("name"):
        score += 15

    # Optional enrichment fields (5 pts each)
    for field in ("linkedin", "phone", "website", "industry", "location"):
        if lead_data.get(field):
            score += 5

    # Cap at 100
    return min(score, 100.0)
