"""Backend services — Core business logic for incident processing."""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from app.models.models import (
    Incident, EmergencyAlert, MedicalAssessment,
    IncidentType, Severity, IncidentStatus, TriggerMode, Location
)
from app.db.memory_store import store
from ai_services.fusion.engine import fuse_multimodal
from ai_services.medical_ai.engine import classify_injury, generate_doctor_summary, suggest_hospital
from ai_services.women_safety.engine import analyze_panic_context


# ═══════════════════════════════════════════════════════════════
# INCIDENT SERVICE
# ═══════════════════════════════════════════════════════════════
def create_incident(
    text: str,
    language: str = "en",
    location: dict = None,
    voice_transcript: str = "",
    image_description: str = "",
    media_urls: list = None,
) -> dict:
    """Process a new incident report through the full AI pipeline."""

    # Run multimodal fusion
    fusion = fuse_multimodal(
        text=text,
        voice_transcript=voice_transcript,
        image_description=image_description,
        location=location,
    )

    # Map event type
    type_map = {
        "disaster": IncidentType.DISASTER,
        "women_safety": IncidentType.WOMEN_SAFETY,
        "medical": IncidentType.MEDICAL,
        "combined": IncidentType.COMBINED,
    }
    incident_type = type_map.get(fusion["event_type"], IncidentType.UNKNOWN)

    # Map severity
    sev_map = {"critical": Severity.CRITICAL, "high": Severity.HIGH, "medium": Severity.MEDIUM, "low": Severity.LOW}
    severity = sev_map.get(fusion["severity"], Severity.MEDIUM)

    loc = Location(**location) if location else None

    # Find nearest safe zone
    nearest = None
    if loc:
        safe = store.find_nearest_safe_location(loc.lat, loc.lng)
        if safe:
            nearest = f"{safe.name} ({safe.type.replace('_', ' ').title()})"

    incident = Incident(
        incident_type=incident_type,
        raw_text=text,
        translated_text=voice_transcript or text,
        keywords=fusion["keywords"],
        severity=severity,
        confidence=fusion["confidence"],
        location=loc,
        status=IncidentStatus.ACTIVE if severity in (Severity.CRITICAL, Severity.HIGH) else IncidentStatus.REPORTED,
        media_files=media_urls or [],
        ai_analysis=fusion,
    )

    store.add_incident(incident)

    return {
        "incident_id": incident.id,
        "incident_type": fusion["event_type"],
        "severity": fusion["severity"],
        "confidence": fusion["confidence"],
        "keywords": fusion["keywords"],
        "recommended_actions": fusion["recommended_actions"],
        "nearest_safe_zone": nearest,
        "ai_analysis": fusion,
    }


# ═══════════════════════════════════════════════════════════════
# EMERGENCY SERVICE
# ═══════════════════════════════════════════════════════════════
def trigger_emergency(
    panic_trigger: bool,
    text: str = "",
    voice_transcript: str = "",
    location: dict = None,
    trigger_mode: str = "panic_button",
    trusted_contacts: list = None,
    offline: bool = False,
    environment_hints: list = None,
) -> dict:
    """Process an emergency SOS trigger through women safety + fusion pipeline."""

    # Run full fusion with panic context
    fusion = fuse_multimodal(
        text=text,
        voice_transcript=voice_transcript,
        location=location,
        panic_trigger=panic_trigger,
        environment_hints=environment_hints or [],
    )

    # Get women safety specific analysis
    ws_analysis = analyze_panic_context(
        f"{text} {voice_transcript}".strip(),
        trigger_mode,
        environment_hints or [],
        location,
    )

    loc = Location(**location) if location else None

    # Find nearest safe zone
    nearest = None
    escape_route = None
    if loc:
        police = store.find_nearest_safe_location(loc.lat, loc.lng, "police_station")
        if police:
            nearest = f"{police.name} — nearby"
            escape_route = f"Head towards {police.name} (well-lit, public area)"

    # Create incident
    sev_map = {"critical": Severity.CRITICAL, "high": Severity.HIGH, "medium": Severity.MEDIUM, "low": Severity.LOW}
    severity = sev_map.get(ws_analysis["severity"], Severity.HIGH)

    incident = Incident(
        incident_type=IncidentType.WOMEN_SAFETY,
        raw_text=text,
        severity=severity,
        confidence=fusion["confidence"],
        location=loc,
        status=IncidentStatus.ACTIVE,
        keywords=fusion["keywords"],
        ai_analysis={**fusion, "women_safety": ws_analysis},
    )
    store.add_incident(incident)

    # Create emergency alert
    mode_map = {
        "panic_button": TriggerMode.PANIC_BUTTON,
        "voice": TriggerMode.VOICE,
        "offline": TriggerMode.OFFLINE,
    }

    contacts = trusted_contacts or ["+91-9876543210 (Emergency Contact)", "+91-1234567890 (Family)"]

    alert = EmergencyAlert(
        incident_id=incident.id,
        trigger_mode=mode_map.get(trigger_mode, TriggerMode.MANUAL),
        text=text,
        location=loc,
        sent_to=contacts,
        delivery_status="sent" if not offline else "queued_offline",
        ai_response=ws_analysis,
    )
    store.add_emergency(alert)

    return {
        "alert_id": alert.id,
        "incident_id": incident.id,
        "incident_type": "women_safety",
        "severity": ws_analysis["severity"],
        "risk_score": ws_analysis["risk_score"],
        "recommended_actions": ws_analysis["recommended_actions"],
        "nearest_safe_zone": nearest,
        "escape_route": escape_route,
        "contacts_notified": contacts,
        "ai_response": ws_analysis,
        "offline_mode": offline,
    }


def sync_offline_events(events: list) -> dict:
    """Process cached offline emergency events."""
    results = []
    for event in events:
        result = trigger_emergency(
            panic_trigger=event.get("panic_trigger", True),
            text=event.get("text", ""),
            location=event.get("location"),
            trigger_mode="offline",
            offline=True,
            environment_hints=event.get("environment_hints", []),
        )
        results.append(result)
    return {"synced": len(results), "results": results}


# ═══════════════════════════════════════════════════════════════
# MEDICAL SERVICE
# ═══════════════════════════════════════════════════════════════
def analyze_medical(
    description: str,
    injury_keywords: list = None,
    image_description: str = "",
    voice_description: str = "",
    location: dict = None,
    language: str = "en",
) -> dict:
    """Process a medical emergency through the medical AI pipeline."""

    combined = f"{description} {image_description} {voice_description}".strip()

    # Classify injury
    classification = classify_injury(combined, injury_keywords)

    # Generate doctor summary
    doctor_summary = generate_doctor_summary(
        classification["injury_type"],
        combined,
        classification["severity"],
    )

    # Suggest hospital
    hospital = suggest_hospital(location)

    loc = Location(**location) if location else None

    # Create incident
    sev_map = {"critical": Severity.CRITICAL, "high": Severity.HIGH, "medium": Severity.MEDIUM, "low": Severity.LOW}

    incident = Incident(
        incident_type=IncidentType.MEDICAL,
        raw_text=description,
        severity=sev_map.get(classification["severity"], Severity.MEDIUM),
        confidence=classification["confidence"],
        location=loc,
        status=IncidentStatus.ACTIVE,
        keywords=injury_keywords or [],
        ai_analysis=classification,
    )
    store.add_incident(incident)

    # Create medical assessment
    assessment = MedicalAssessment(
        incident_id=incident.id,
        description=combined,
        injury_type=classification["injury_type"],
        severity=sev_map.get(classification["severity"], Severity.MEDIUM),
        first_aid=classification["first_aid"],
        hospital_suggestion=hospital,
        urgency_level=classification["urgency"],
        ai_analysis={
            **classification,
            "do_not": classification.get("do_not", []),
            "doctor_summary": doctor_summary,
        },
    )
    store.add_medical(assessment)

    return {
        "assessment_id": assessment.id,
        "incident_id": incident.id,
        "injury_type": classification["injury_type"].replace("_", " ").title(),
        "severity": classification["severity"],
        "urgency_level": classification["urgency"],
        "confidence": classification["confidence"],
        "first_aid": classification["first_aid"],
        "do_not": classification.get("do_not", []),
        "hospital_suggestion": hospital,
        "doctor_summary": doctor_summary,
        "ai_analysis": classification,
    }
