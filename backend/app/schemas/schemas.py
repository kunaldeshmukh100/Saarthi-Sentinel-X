"""Request/Response schemas."""

from pydantic import BaseModel
from typing import Optional, List


# ─── Report Schemas ────────────────────────────────────────────
class ReportCreateRequest(BaseModel):
    text: str = ""
    language: str = "en"
    location: Optional[dict] = None  # {"lat": ..., "lng": ...}
    voice_transcript: str = ""
    image_description: str = ""
    media_urls: List[str] = []


class ReportResponse(BaseModel):
    incident_id: str
    incident_type: str
    severity: str
    confidence: float
    keywords: List[str]
    recommended_actions: List[str]
    nearest_safe_zone: Optional[str] = None
    ai_analysis: dict = {}


# ─── Emergency Schemas ─────────────────────────────────────────
class EmergencyTriggerRequest(BaseModel):
    panic_trigger: bool = True
    text: str = ""
    voice_transcript: str = ""
    location: Optional[dict] = None
    trigger_mode: str = "panic_button"
    trusted_contacts: List[str] = []
    offline: bool = False
    audio_snapshot: str = ""
    environment_hints: List[str] = []  # "dark", "isolated", "crowded"


class EmergencyResponse(BaseModel):
    alert_id: str
    incident_type: str
    severity: str
    recommended_actions: List[str]
    nearest_safe_zone: Optional[str] = None
    escape_route: Optional[str] = None
    contacts_notified: List[str] = []
    ai_response: dict = {}


class OfflineSyncRequest(BaseModel):
    events: List[dict] = []  # cached offline emergency events


# ─── Medical Schemas ───────────────────────────────────────────
class MedicalAnalyzeRequest(BaseModel):
    description: str = ""
    injury_keywords: List[str] = []
    image_description: str = ""
    voice_description: str = ""
    location: Optional[dict] = None
    language: str = "en"


class MedicalResponse(BaseModel):
    assessment_id: str
    injury_type: str
    severity: str
    urgency_level: str
    first_aid: List[str]
    hospital_suggestion: str
    doctor_summary: str = ""
    ai_analysis: dict = {}


# ─── Dashboard Schemas ─────────────────────────────────────────
class DashboardSummary(BaseModel):
    total_incidents: int
    active_incidents: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    by_type: dict = {}
    recent_alerts: List[dict] = []


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    intensity: float
    type: str
