"""API Routes — Medical AI."""

from fastapi import APIRouter

from app.schemas.schemas import MedicalAnalyzeRequest
from app.services.core_services import analyze_medical
from app.db.memory_store import store

router = APIRouter(prefix="/medical", tags=["Medical"])


@router.post("/analyze")
async def analyze(req: MedicalAnalyzeRequest):
    """Analyze a medical emergency — runs medical AI pipeline."""
    result = analyze_medical(
        description=req.description,
        injury_keywords=req.injury_keywords,
        image_description=req.image_description,
        voice_description=req.voice_description,
        location=req.location,
        language=req.language,
    )
    return result


@router.get("/result/{incident_id}")
async def get_medical_result(incident_id: str):
    """Get medical assessment by incident ID."""
    assessment = store.get_medical_by_incident(incident_id)
    if not assessment:
        return {"error": "Medical assessment not found"}
    return assessment.model_dump()
