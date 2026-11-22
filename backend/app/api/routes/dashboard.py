"""API Routes — Admin Dashboard."""

from fastapi import APIRouter
from app.db.memory_store import store

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/cases")
async def get_cases(limit: int = 50):
    """Get all cases for dashboard display."""
    incidents = store.list_incidents(limit)
    cases = []
    for i in incidents:
        cases.append({
            "id": i.id,
            "type": i.incident_type.value,
            "severity": i.severity.value,
            "status": i.status.value,
            "text": i.raw_text[:100],
            "keywords": i.keywords[:5],
            "confidence": i.confidence,
            "location": i.location.model_dump() if i.location else None,
            "created_at": i.created_at,
        })
    return {"total": len(cases), "cases": cases}


@router.get("/summary")
async def get_summary():
    """Get dashboard summary statistics."""
    return store.get_summary()


@router.get("/heatmap")
async def get_heatmap():
    """Get incident heatmap data."""
    incidents = store.list_incidents(100)
    points = []
    for i in incidents:
        if i.location:
            intensity_map = {"critical": 1.0, "high": 0.75, "medium": 0.5, "low": 0.25}
            points.append({
                "lat": i.location.lat,
                "lng": i.location.lng,
                "intensity": intensity_map.get(i.severity.value, 0.5),
                "type": i.incident_type.value,
                "id": i.id,
            })
    return {"points": points}
