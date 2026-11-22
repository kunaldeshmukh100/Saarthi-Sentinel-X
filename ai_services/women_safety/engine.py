"""Women Safety AI Module — Panic context, unsafe environment, voice stress."""

from typing import Dict, List
from datetime import datetime


def analyze_panic_context(
    text: str,
    trigger_mode: str,
    environment_hints: List[str],
    location: dict = None,
) -> Dict:
    """Analyze full panic context and produce a women safety risk assessment."""
    risk_score = 0.0
    risk_factors = []
    recommended_actions = []

    # Panic trigger itself is a strong signal
    if trigger_mode in ("panic_button", "voice"):
        risk_score += 0.3
        risk_factors.append("panic_trigger_activated")

    # Text analysis
    text_lower = text.lower()
    danger_phrases = [
        ("following", 0.25, "potential_stalking"),
        ("chasing", 0.3, "active_pursuit"),
        ("attack", 0.35, "assault_indicated"),
        ("alone", 0.15, "isolated_person"),
        ("dark", 0.15, "dark_environment"),
        ("scared", 0.2, "fear_expressed"),
        ("help", 0.2, "help_requested"),
        ("bachao", 0.25, "distress_hindi"),
        ("threatening", 0.25, "threat_detected"),
        ("touching", 0.3, "physical_contact"),
        ("stranger", 0.2, "unknown_person"),
    ]

    for phrase, score, factor in danger_phrases:
        if phrase in text_lower:
            risk_score += score
            risk_factors.append(factor)

    # Environment analysis
    env_risks = {
        "dark": (0.2, "low_visibility"),
        "isolated": (0.25, "isolated_area"),
        "night": (0.2, "nighttime"),
        "empty": (0.15, "empty_area"),
        "alley": (0.2, "confined_space"),
        "deserted": (0.2, "deserted_area"),
    }

    for hint in environment_hints:
        if hint.lower() in env_risks:
            score, factor = env_risks[hint.lower()]
            risk_score += score
            risk_factors.append(factor)

    # Time-based risk (late night = higher risk)
    current_hour = datetime.now().hour
    if current_hour >= 22 or current_hour <= 5:
        risk_score += 0.2
        risk_factors.append("late_night_hours")

    # Cap at 1.0
    risk_score = min(1.0, risk_score)

    # Determine severity
    if risk_score >= 0.7:
        severity = "critical"
        recommended_actions = [
            "🚨 EMERGENCY: Move to nearest public/lighted area immediately",
            "📍 Live location shared with trusted contacts",
            "🚓 Alert sent to nearest police station",
            "📸 Auto-capture activated for evidence",
            "🔊 Loud alarm siren activated on device",
        ]
    elif risk_score >= 0.4:
        severity = "high"
        recommended_actions = [
            "⚠️ Move towards crowded or well-lit area",
            "📍 Location being tracked — share with trusted person",
            "📱 Keep this app open and visible",
            "🗣️ If possible, call someone and stay on the line",
        ]
    elif risk_score >= 0.2:
        severity = "medium"
        recommended_actions = [
            "🔔 Stay alert and aware of surroundings",
            "📍 Share your live location with someone you trust",
            "🚶 Head towards a crowded area",
        ]
    else:
        severity = "low"
        recommended_actions = [
            "✅ No immediate danger detected",
            "📍 Your location has been noted",
            "📱 Keep the app accessible if you feel unsafe",
        ]

    return {
        "risk_score": round(risk_score, 2),
        "severity": severity,
        "risk_factors": risk_factors,
        "recommended_actions": recommended_actions,
        "environment_assessment": {
            "time_risk": "high" if (current_hour >= 22 or current_hour <= 5) else "normal",
            "current_hour": current_hour,
        },
    }


def detect_unsafe_environment(environment_hints: List[str], location: dict = None) -> Dict:
    """Assess environment safety from hints and location."""
    unsafe_factors = []
    safety_score = 1.0  # 1.0 = fully safe, 0.0 = extremely unsafe

    risk_map = {
        "dark": 0.2,
        "isolated": 0.25,
        "night": 0.2,
        "empty": 0.15,
        "alley": 0.2,
        "deserted": 0.2,
        "construction": 0.1,
        "parking": 0.15,
        "forest": 0.2,
        "highway": 0.15,
    }

    for hint in environment_hints:
        hint_lower = hint.lower()
        if hint_lower in risk_map:
            safety_score -= risk_map[hint_lower]
            unsafe_factors.append(hint_lower)

    safety_score = max(0.0, safety_score)

    return {
        "safety_score": round(safety_score, 2),
        "is_unsafe": safety_score < 0.5,
        "unsafe_factors": unsafe_factors,
        "recommendation": "Move to well-lit, crowded area" if safety_score < 0.5 else "Environment appears reasonably safe",
    }
