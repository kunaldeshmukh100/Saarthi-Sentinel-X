"""API Routes — Incident Reports."""

from fastapi import APIRouter

from app.schemas.schemas import ReportCreateRequest, ReportResponse
from app.services.core_services import create_incident
from app.db.memory_store import store

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/create")
async def create_report(req: ReportCreateRequest):
    """Create a new incident report — runs full AI pipeline."""
    result = create_incident(
        text=req.text,
        language=req.language,
        location=req.location,
        voice_transcript=req.voice_transcript,
        image_description=req.image_description,
        media_urls=req.media_urls,
    )
    return result


@router.get("/{incident_id}")
async def get_report(incident_id: str):
    """Get a specific incident by ID."""
    incident = store.get_incident(incident_id)
    if not incident:
        return {"error": "Incident not found"}
    return incident.model_dump()


@router.get("/list/all")
async def list_reports(limit: int = 50):
    """List all incidents."""
    incidents = store.list_incidents(limit)
    return {"total": len(incidents), "incidents": [i.model_dump() for i in incidents]}
