import io
from typing import List
import pandas as pd
from backend.models.lead import LeadCreate
from backend.core.logger import get_logger

logger = get_logger(__name__)

# Column name aliases → our field names
_ALIASES: dict[str, str] = {
    # name
    "name": "name",
    "full name": "name",
    "full_name": "name",
    "contact name": "name",
    # company
    "company": "company",
    "company name": "company",
    "organization": "company",
    "organisation": "company",
    # email
    "email": "email",
    "email address": "email",
    "work email": "email",
    # industry
    "industry": "industry",
    "sector": "industry",
    # location
    "location": "location",
    "city": "location",
    "country": "location",
    # phone
    "phone": "phone",
    "phone number": "phone",
    "mobile": "phone",
    # linkedin
    "linkedin": "linkedin",
    "linkedin url": "linkedin",
    "linkedin profile": "linkedin",
    # website
    "website": "website",
    "url": "website",
    "web": "website",
    # notes
    "notes": "notes",
    "note": "notes",
    "comments": "notes",
}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).strip().lower() for c in df.columns]
    rename_map = {}
    for col in df.columns:
        if col in _ALIASES:
            rename_map[col] = _ALIASES[col]
    return df.rename(columns=rename_map)


def parse_csv_or_excel(file_bytes: bytes, filename: str, batch: str = "", description: str = "") -> List[LeadCreate]:
    """Parse uploaded CSV or Excel file and return a list of LeadCreate objects."""
    try:
        if filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Could not parse file: {exc}") from exc

    df = _normalize_columns(df)
    df = df.where(pd.notnull(df), None)

    required = {"name", "email", "company"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"File is missing required columns: {missing}")

    leads: List[LeadCreate] = []
    for _, row in df.iterrows():
        row_dict = row.to_dict()
        try:
            lead = LeadCreate(
                name=str(row_dict.get("name") or "").strip(),
                email=str(row_dict.get("email") or "").strip(),
                company=str(row_dict.get("company") or "").strip(),
                industry=str(row_dict.get("industry") or "").strip(),
                location=str(row_dict.get("location") or "").strip(),
                phone=str(row_dict.get("phone") or "").strip(),
                linkedin=str(row_dict.get("linkedin") or "").strip(),
                website=str(row_dict.get("website") or "").strip(),
                notes=str(row_dict.get("notes") or "").strip(),
                batch=batch,
                description=description,
            )
            if lead.name and lead.email and lead.company:
                leads.append(lead)
        except Exception as exc:
            logger.warning("Skipping row due to validation error: %s", exc)

    logger.info("Parsed %d valid leads from '%s' (batch=%r, description=%r)", len(leads), filename, batch, description)
    return leads
