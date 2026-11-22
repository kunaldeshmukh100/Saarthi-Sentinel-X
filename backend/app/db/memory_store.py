"""In-memory data store with thread-safe collections and demo data seeding."""

import threading
from typing import List, Optional
from app.models.models import (
    Incident, EmergencyAlert, MedicalAssessment, SafeLocation,
    IncidentType, Severity, IncidentStatus, Location
)


class MemoryStore:
    """Thread-safe in-memory store — replaces PostgreSQL for hackathon MVP."""

    def __init__(self):
        self._lock = threading.Lock()
        self.incidents: List[Incident] = []
        self.emergencies: List[EmergencyAlert] = []
        self.medical_assessments: List[MedicalAssessment] = []
        self.safe_locations: List[SafeLocation] = []

    # ─── Incidents ─────────────────────────────────────────────
    def add_incident(self, incident: Incident) -> Incident:
        with self._lock:
            self.incidents.append(incident)
        return incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        for i in self.incidents:
            if i.id == incident_id:
                return i
        return None

    def list_incidents(self, limit: int = 50) -> List[Incident]:
        return sorted(self.incidents, key=lambda x: x.created_at, reverse=True)[:limit]

    # ─── Emergencies ───────────────────────────────────────────
    def add_emergency(self, alert: EmergencyAlert) -> EmergencyAlert:
        with self._lock:
            self.emergencies.append(alert)
        return alert

    def get_emergency(self, alert_id: str) -> Optional[EmergencyAlert]:
        for e in self.emergencies:
            if e.id == alert_id:
                return e
        return None

    # ─── Medical ───────────────────────────────────────────────
    def add_medical(self, assessment: MedicalAssessment) -> MedicalAssessment:
        with self._lock:
            self.medical_assessments.append(assessment)
        return assessment

    def get_medical(self, assessment_id: str) -> Optional[MedicalAssessment]:
        for m in self.medical_assessments:
            if m.id == assessment_id:
                return m
        return None

    def get_medical_by_incident(self, incident_id: str) -> Optional[MedicalAssessment]:
        for m in self.medical_assessments:
            if m.incident_id == incident_id:
                return m
        return None

    # ─── Safe Locations ────────────────────────────────────────
    def get_safe_locations(self, type_filter: str = None) -> List[SafeLocation]:
        if type_filter:
            return [s for s in self.safe_locations if s.type == type_filter]
        return self.safe_locations

    def find_nearest_safe_location(self, lat: float, lng: float, loc_type: str = None) -> Optional[SafeLocation]:
        locations = self.get_safe_locations(loc_type)
        if not locations:
            return None
        return min(locations, key=lambda s: ((s.lat - lat)**2 + (s.lng - lng)**2)**0.5)

    # ─── Dashboard ─────────────────────────────────────────────
    def get_summary(self) -> dict:
        total = len(self.incidents)
        active = len([i for i in self.incidents if i.status in (IncidentStatus.ACTIVE, IncidentStatus.ANALYZING, IncidentStatus.REPORTED)])
        severity_counts = {s.value: 0 for s in Severity}
        type_counts = {t.value: 0 for t in IncidentType}
        for i in self.incidents:
            severity_counts[i.severity.value] = severity_counts.get(i.severity.value, 0) + 1
            type_counts[i.incident_type.value] = type_counts.get(i.incident_type.value, 0) + 1

        return {
            "total_incidents": total,
            "active_incidents": active,
            "critical_count": severity_counts.get("critical", 0),
            "high_count": severity_counts.get("high", 0),
            "medium_count": severity_counts.get("medium", 0),
            "low_count": severity_counts.get("low", 0),
            "by_type": type_counts,
            "recent_alerts": [
                {"id": e.id, "trigger": e.trigger_mode, "time": e.created_at}
                for e in sorted(self.emergencies, key=lambda x: x.created_at, reverse=True)[:5]
            ],
        }

    # ─── Demo Data ─────────────────────────────────────────────
    def seed_demo_data(self):
        """Pre-seed safe locations and sample incidents for demo."""
        self.safe_locations = [
            SafeLocation(id="sl-01", name="Central Police Station", type="police_station", lat=28.6139, lng=77.2090, district="Central Delhi"),
            SafeLocation(id="sl-02", name="AIIMS Hospital", type="hospital", lat=28.5672, lng=77.2100, district="South Delhi"),
            SafeLocation(id="sl-03", name="Safdarjung Hospital", type="hospital", lat=28.5685, lng=77.2066, district="South Delhi"),
            SafeLocation(id="sl-04", name="Delhi Fire Station - Connaught Place", type="fire_station", lat=28.6315, lng=77.2167, district="Central Delhi"),
            SafeLocation(id="sl-05", name="Disaster Relief Shelter - Pragati Maidan", type="shelter", lat=28.6180, lng=77.2494, district="Central Delhi"),
            SafeLocation(id="sl-06", name="Women Helpline Center - Janpath", type="police_station", lat=28.6195, lng=77.2192, district="Central Delhi"),
            SafeLocation(id="sl-07", name="Ram Manohar Lohia Hospital", type="hospital", lat=28.6263, lng=77.2044, district="Central Delhi"),
            SafeLocation(id="sl-08", name="GTB Hospital", type="hospital", lat=28.6862, lng=77.3105, district="East Delhi"),
            SafeLocation(id="sl-09", name="Community Shelter - Lajpat Nagar", type="shelter", lat=28.5700, lng=77.2400, district="South Delhi"),
            SafeLocation(id="sl-10", name="Police Booth - India Gate", type="police_station", lat=28.6129, lng=77.2295, district="Central Delhi"),
        ]

        # Sample incidents for dashboard demo
        sample_incidents = [
            Incident(
                id="demo-01", incident_type=IncidentType.DISASTER, raw_text="Heavy flooding reported near Yamuna banks",
                severity=Severity.CRITICAL, confidence=0.92,
                location=Location(lat=28.6400, lng=77.2300), status=IncidentStatus.ACTIVE,
                keywords=["flood", "yamuna", "heavy", "water"],
                ai_analysis={"type": "flood", "risk_level": "extreme"}
            ),
            Incident(
                id="demo-02", incident_type=IncidentType.WOMEN_SAFETY, raw_text="Woman reports being followed in dark alley",
                severity=Severity.HIGH, confidence=0.88,
                location=Location(lat=28.5900, lng=77.2100), status=IncidentStatus.DISPATCHED,
                keywords=["followed", "dark", "woman", "unsafe"],
                ai_analysis={"type": "stalking", "environment": "isolated_dark"}
            ),
            Incident(
                id="demo-03", incident_type=IncidentType.MEDICAL, raw_text="Road accident victim with bleeding injury",
                severity=Severity.HIGH, confidence=0.85,
                location=Location(lat=28.6100, lng=77.2250), status=IncidentStatus.ACTIVE,
                keywords=["accident", "bleeding", "injury", "road"],
                ai_analysis={"type": "trauma", "injury": "bleeding_wound"}
            ),
            Incident(
                id="demo-04", incident_type=IncidentType.DISASTER, raw_text="Fire reported in Chandni Chowk market area",
                severity=Severity.CRITICAL, confidence=0.95,
                location=Location(lat=28.6506, lng=77.2310), status=IncidentStatus.ACTIVE,
                keywords=["fire", "market", "smoke", "chandni_chowk"],
                ai_analysis={"type": "fire", "risk_level": "extreme"}
            ),
            Incident(
                id="demo-05", incident_type=IncidentType.COMBINED, raw_text="Earthquake damage - multiple injuries, trapped people",
                severity=Severity.CRITICAL, confidence=0.90,
                location=Location(lat=28.6300, lng=77.2200), status=IncidentStatus.REPORTED,
                keywords=["earthquake", "trapped", "injuries", "damage"],
                ai_analysis={"type": "earthquake", "casualties_estimated": "multiple"}
            ),
        ]
        self.incidents.extend(sample_incidents)


# Singleton instance
store = MemoryStore()
