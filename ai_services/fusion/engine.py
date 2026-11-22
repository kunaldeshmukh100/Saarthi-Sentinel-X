"""Multimodal Fusion Engine — Combines all AI signals into unified assessment."""

from typing import Dict, List, Optional
import sys
import os

# Add project root to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from ai_services.speech_nlp.engine import extract_keywords, detect_distress
from ai_services.women_safety.engine import analyze_panic_context, detect_unsafe_environment
from ai_services.medical_ai.engine import classify_injury


def classify_event(keywords: Dict, panic_trigger: bool = False) -> str:
    """Classify the event type from extracted keywords and context."""
    disaster_score = len(keywords.get("disaster", []))
    safety_score = len(keywords.get("women_safety", []))
    medical_score = len(keywords.get("medical", []))

    if panic_trigger:
        safety_score += 2

    # Combined if multiple types present
    types_present = sum([disaster_score > 0, safety_score > 0, medical_score > 0])
    if types_present >= 2:
        return "combined"

    if safety_score > disaster_score and safety_score > medical_score:
        return "women_safety"
    elif disaster_score > medical_score:
        return "disaster"
    elif medical_score > 0:
        return "medical"
    return "unknown"


def compute_severity(
    distress: Dict,
    keywords: Dict,
    panic_trigger: bool = False,
    environment_hints: List[str] = None,
) -> Dict:
    """Compute overall severity combining all signals."""
    score = 0.0
    factors = []

    # Keyword density
    total_keywords = len(keywords.get("all_keywords", []))
    if total_keywords >= 5:
        score += 0.3
        factors.append("high_keyword_density")
    elif total_keywords >= 3:
        score += 0.2
        factors.append("moderate_keyword_density")
    elif total_keywords >= 1:
        score += 0.1
        factors.append("some_keywords_detected")

    # Distress signals
    if distress.get("is_distressed"):
        score += distress["distress_score"] * 0.3
        factors.append("distress_detected")

    # Panic trigger
    if panic_trigger:
        score += 0.25
        factors.append("panic_button_pressed")

    # Environment
    if environment_hints:
        env = detect_unsafe_environment(environment_hints)
        if env["is_unsafe"]:
            score += 0.2
            factors.append("unsafe_environment")

    # Critical keywords boost
    critical_words = {"fire", "earthquake", "attack", "bleeding", "unconscious", "trapped", "heart_attack"}
    found_critical = critical_words & set(keywords.get("all_keywords", []))
    if found_critical:
        score += 0.2
        factors.append(f"critical_keywords: {', '.join(found_critical)}")

    score = min(1.0, score)

    if score >= 0.7:
        severity = "critical"
    elif score >= 0.5:
        severity = "high"
    elif score >= 0.3:
        severity = "medium"
    else:
        severity = "low"

    return {
        "severity": severity,
        "severity_score": round(score, 2),
        "confidence": round(min(1.0, 0.5 + total_keywords * 0.1), 2),
        "factors": factors,
    }


def fuse_multimodal(
    text: str = "",
    voice_transcript: str = "",
    image_description: str = "",
    location: dict = None,
    panic_trigger: bool = False,
    environment_hints: List[str] = None,
    injury_keywords: List[str] = None,
) -> Dict:
    """Main fusion function — processes all inputs and returns unified assessment."""

    # Combine all text inputs
    combined_text = f"{text} {voice_transcript} {image_description}".strip()

    # Step 1: Extract keywords
    keywords = extract_keywords(combined_text)

    # Step 2: Detect distress
    distress = detect_distress(combined_text)

    # Step 3: Classify event
    event_type = classify_event(keywords, panic_trigger)

    # Step 4: Compute severity
    severity_result = compute_severity(
        distress, keywords, panic_trigger, environment_hints or []
    )

    # Step 5: Get type-specific analysis
    analyses = {}

    if event_type in ("women_safety", "combined") or panic_trigger:
        analyses["women_safety"] = analyze_panic_context(
            combined_text,
            "panic_button" if panic_trigger else "manual",
            environment_hints or [],
            location,
        )

    if event_type in ("medical", "combined") or injury_keywords:
        analyses["medical"] = classify_injury(
            combined_text,
            injury_keywords,
        )

    # Step 6: Generate recommended actions
    actions = _generate_actions(event_type, severity_result["severity"], analyses)

    return {
        "event_type": event_type,
        "severity": severity_result["severity"],
        "severity_score": severity_result["severity_score"],
        "confidence": severity_result["confidence"],
        "keywords": keywords["all_keywords"],
        "distress": distress,
        "severity_factors": severity_result["factors"],
        "analyses": analyses,
        "recommended_actions": actions,
    }


def _generate_actions(event_type: str, severity: str, analyses: dict) -> List[str]:
    """Generate contextual actions based on event type and severity."""
    actions = []

    if event_type == "disaster":
        if severity in ("critical", "high"):
            actions = [
                "🚨 Emergency services have been notified",
                "🗺️ Evacuate to nearest safe zone immediately",
                "📍 Your location has been shared with rescue teams",
                "📻 Stay tuned to emergency broadcasts",
                "🏥 Nearest shelter is being identified",
            ]
        else:
            actions = [
                "ℹ️ Situation noted and being monitored",
                "📍 Your location has been recorded",
                "🔔 Stay alert for further instructions",
            ]

    elif event_type == "women_safety":
        ws = analyses.get("women_safety", {})
        actions = ws.get("recommended_actions", [
            "📍 Location shared with trusted contacts",
            "🚓 Nearest police station notified",
        ])

    elif event_type == "medical":
        med = analyses.get("medical", {})
        actions = med.get("first_aid", [
            "🏥 Seek immediate medical attention",
        ])

    elif event_type == "combined":
        actions = ["🚨 MULTI-THREAT DETECTED — Combined response activated"]
        ws = analyses.get("women_safety", {})
        med = analyses.get("medical", {})
        if ws:
            actions.extend(ws.get("recommended_actions", [])[:3])
        if med:
            actions.extend(med.get("first_aid", [])[:3])

    else:
        actions = [
            "ℹ️ Report received and being analyzed",
            "📍 Location noted",
            "📱 Keep this app accessible",
        ]

    return actions
