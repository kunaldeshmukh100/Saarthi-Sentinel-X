"""Data models for the application."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class IncidentType(str, Enum):
    DISASTER = "disaster"
    WOMEN_SAFETY = "women_safety"
    MEDICAL = "medical"
    COMBINED = "combined"
    UNKNOWN = "unknown"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    REPORTED = "reported"
    ANALYZING = "analyzing"
    ACTIVE = "active"
    DISPATCHED = "dispatched"
    RESOLVED = "resolved"


class TriggerMode(str, Enum):
    PANIC_BUTTON = "panic_button"
    VOICE = "voice"
    MANUAL = "manual"
    OFFLINE = "offline"


class Location(BaseModel):
    lat: float
    lng: float


class Incident(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    user_id: str = "anonymous"
    incident_type: IncidentType = IncidentType.UNKNOWN
    raw_text: str = ""
    translated_text: str = ""
    keywords: List[str] = []
    severity: Severity = Severity.MEDIUM
    confidence: float = 0.0
    location: Optional[Location] = None
    status: IncidentStatus = IncidentStatus.REPORTED
    media_files: List[str] = []
    ai_analysis: dict = {}
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class EmergencyAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    incident_id: str = ""
    trigger_mode: TriggerMode = TriggerMode.PANIC_BUTTON
    text: str = ""
    location: Optional[Location] = None
    sent_to: List[str] = []
    delivery_status: str = "pending"
    ai_response: dict = {}
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class MedicalAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    incident_id: str = ""
    description: str = ""
    injury_type: str = "unknown"
    severity: Severity = Severity.MEDIUM
    first_aid: List[str] = []
    hospital_suggestion: str = ""
    urgency_level: str = "moderate"
    ai_analysis: dict = {}
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class SafeLocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    type: str  # police_station, hospital, shelter, fire_station
    lat: float
    lng: float
    district: str = ""
