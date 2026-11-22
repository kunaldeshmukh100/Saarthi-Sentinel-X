"""API Routes — Emergency SOS."""

from fastapi import APIRouter

from app.schemas.schemas import EmergencyTriggerRequest, OfflineSyncRequest
from app.services.core_services import trigger_emergency, sync_offline_events
from app.db.memory_store import store

router = APIRouter(prefix="/emergency", tags=["Emergency"])


@router.post("/trigger")
async def trigger_sos(req: EmergencyTriggerRequest):
    """Trigger emergency SOS — runs women safety AI pipeline."""
    result = trigger_emergency(
        panic_trigger=req.panic_trigger,
        text=req.text,
        voice_transcript=req.voice_transcript,
        location=req.location,
        trigger_mode=req.trigger_mode,
        trusted_contacts=req.trusted_contacts,
        offline=req.offline,
        environment_hints=req.environment_hints,
    )
    return result


@router.post("/offline-sync")
async def offline_sync(req: OfflineSyncRequest):
    """Sync cached offline emergency events."""
    result = sync_offline_events(req.events)
    return result


@router.get("/{alert_id}")
async def get_emergency(alert_id: str):
    """Get a specific emergency alert by ID."""
    alert = store.get_emergency(alert_id)
    if not alert:
        return {"error": "Emergency alert not found"}
    return alert.model_dump()
