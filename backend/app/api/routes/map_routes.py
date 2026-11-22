"""API Routes — Map / Geospatial."""

from fastapi import APIRouter
from app.db.memory_store import store

router = APIRouter(prefix="/map", tags=["Map"])


@router.get("/incidents")
async def get_map_incidents():
    """Get all incidents with locations for map display."""
    incidents = store.list_incidents(200)
    markers = []
    for i in incidents:
        if i.location:
            markers.append({
                "id": i.id,
                "lat": i.location.lat,
                "lng": i.location.lng,
                "type": i.incident_type.value,
                "severity": i.severity.value,
                "text": i.raw_text[:80],
                "status": i.status.value,
                "created_at": i.created_at,
            })
    return {"markers": markers}


@router.get("/safe-zones")
async def get_safe_zones(type_filter: str = None):
    """Get safe locations (police, hospitals, shelters, fire stations)."""
    locations = store.get_safe_locations(type_filter)
    return {
        "total": len(locations),
        "locations": [loc.model_dump() for loc in locations],
    }


@router.get("/route")
async def get_escape_route(lat: float, lng: float, destination_type: str = "police_station"):
    """Get nearest safe location for escape route."""
    nearest = store.find_nearest_safe_location(lat, lng, destination_type)
    if not nearest:
        return {"error": "No safe location found"}
    return {
        "from": {"lat": lat, "lng": lng},
        "to": {"lat": nearest.lat, "lng": nearest.lng, "name": nearest.name, "type": nearest.type},
        "instruction": f"Head towards {nearest.name} — stay on main roads, well-lit areas",
    }
