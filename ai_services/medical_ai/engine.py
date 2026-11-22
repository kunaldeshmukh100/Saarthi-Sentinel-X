"""Medical AI Module — Injury classification, first aid generation, triage."""

from typing import Dict, List


# ─── Injury Classification ─────────────────────────────────────
INJURY_PROFILES = {
    "bleeding_wound": {
        "keywords": ["bleeding", "blood", "cut", "wound", "laceration", "gash", "deep_cut", "slash"],
        "severity_default": "high",
        "urgency": "immediate",
        "first_aid": [
            "1️⃣ Apply firm, direct pressure with a clean cloth or bandage",
            "2️⃣ If blood soaks through, add more layers — do NOT remove the first cloth",
            "3️⃣ Elevate the injured area above heart level if possible",
            "4️⃣ If bleeding is severe, apply a tourniquet above the wound (last resort)",
            "5️⃣ Keep the person calm and lying down to prevent shock",
            "6️⃣ Call emergency services (112) immediately for severe bleeding",
        ],
        "do_not": [
            "❌ Do NOT remove embedded objects from wounds",
            "❌ Do NOT apply direct pressure on an eye injury or skull fracture",
            "❌ Do NOT use a tourniquet unless bleeding is life-threatening",
        ],
    },
    "burn": {
        "keywords": ["burn", "scalded", "fire_injury", "chemical_burn", "hot_water", "steam", "boiling"],
        "severity_default": "high",
        "urgency": "immediate",
        "first_aid": [
            "1️⃣ Cool the burn under running cool (NOT cold) water for at least 20 minutes",
            "2️⃣ Remove clothing and jewelry near the burn — unless stuck to skin",
            "3️⃣ Cover with a clean, non-fluffy material (cling film works well)",
            "4️⃣ Do NOT apply ice, butter, toothpaste, or any home remedy",
            "5️⃣ Take over-the-counter pain relief if needed",
            "6️⃣ Seek medical attention for burns larger than palm size or on face/hands/joints",
        ],
        "do_not": [
            "❌ Do NOT apply ice or very cold water — causes further tissue damage",
            "❌ Do NOT burst blisters — increases infection risk",
            "❌ Do NOT apply butter, oil, toothpaste, or cream",
        ],
    },
    "fracture": {
        "keywords": ["fracture", "broken_bone", "crack", "twisted", "sprain", "swollen", "deformed"],
        "severity_default": "high",
        "urgency": "urgent",
        "first_aid": [
            "1️⃣ Do NOT move the injured area — immobilize it",
            "2️⃣ Apply a splint using rigid material (stick, rolled newspaper)",
            "3️⃣ Apply ice wrapped in cloth to reduce swelling (20 min on, 20 min off)",
            "4️⃣ Elevate the injured limb if possible",
            "5️⃣ For open fractures (bone visible), cover with clean cloth — do NOT push bone back",
            "6️⃣ Get to hospital immediately — X-ray needed",
        ],
        "do_not": [
            "❌ Do NOT try to realign the bone",
            "❌ Do NOT apply heat to the injury",
            "❌ Do NOT let the person walk on a suspected leg fracture",
        ],
    },
    "unconscious_person": {
        "keywords": ["unconscious", "fainted", "unresponsive", "passed_out", "not_breathing", "collapsed"],
        "severity_default": "critical",
        "urgency": "life_threatening",
        "first_aid": [
            "1️⃣ Check for response — tap shoulders and shout 'Are you okay?'",
            "2️⃣ Call 112 immediately",
            "3️⃣ Check breathing — look for chest rise, listen, feel for 10 seconds",
            "4️⃣ If breathing: place in recovery position (on side)",
            "5️⃣ If NOT breathing: start CPR — 30 chest compressions, 2 rescue breaths",
            "6️⃣ Continue CPR until help arrives or person starts breathing",
            "7️⃣ If available, use an AED (Automated External Defibrillator)",
        ],
        "do_not": [
            "❌ Do NOT move the person unless in immediate danger",
            "❌ Do NOT give food or water to an unconscious person",
            "❌ Do NOT slap or throw water to 'wake them up'",
        ],
    },
    "cardiac_emergency": {
        "keywords": ["heart", "chest_pain", "cardiac", "heart_attack", "breathing_difficulty", "palpitation"],
        "severity_default": "critical",
        "urgency": "life_threatening",
        "first_aid": [
            "1️⃣ Call 112 immediately — say 'suspected heart attack'",
            "2️⃣ Help the person sit in a comfortable position (W-position: knees bent, leaning forward)",
            "3️⃣ If available, give 1 adult aspirin (300mg) to chew",
            "4️⃣ Loosen tight clothing",
            "5️⃣ If person becomes unconscious and stops breathing, start CPR",
            "6️⃣ Stay with them and keep them calm until ambulance arrives",
        ],
        "do_not": [
            "❌ Do NOT let them walk or exert themselves",
            "❌ Do NOT ignore chest pain — even if it seems mild",
        ],
    },
    "head_injury": {
        "keywords": ["head", "concussion", "head_injury", "skull", "dizzy", "hit_head"],
        "severity_default": "high",
        "urgency": "urgent",
        "first_aid": [
            "1️⃣ Keep the person still — do NOT move their neck",
            "2️⃣ Apply gentle pressure with clean cloth if bleeding from scalp",
            "3️⃣ Monitor for danger signs: vomiting, confusion, unequal pupils, clear fluid from ears/nose",
            "4️⃣ Keep them awake and talking if conscious",
            "5️⃣ If unconscious but breathing, place in recovery position supporting neck",
            "6️⃣ Seek immediate medical attention",
        ],
        "do_not": [
            "❌ Do NOT move the person's neck — possible spinal injury",
            "❌ Do NOT remove any object embedded in the skull",
            "❌ Do NOT let them sleep for several hours after — monitor regularly",
        ],
    },
    "snake_bite": {
        "keywords": ["snake", "bite", "venom", "fangs", "serpent"],
        "severity_default": "critical",
        "urgency": "life_threatening",
        "first_aid": [
            "1️⃣ Keep the person calm and still — movement spreads venom",
            "2️⃣ Remove jewelry and tight clothing near the bite",
            "3️⃣ Keep the bitten limb below heart level",
            "4️⃣ Mark the edge of swelling with a pen and note the time",
            "5️⃣ Get to hospital immediately — antivenom is the ONLY treatment",
            "6️⃣ Try to remember the snake's appearance for identification",
        ],
        "do_not": [
            "❌ Do NOT cut the bite wound or try to suck out venom",
            "❌ Do NOT apply a tourniquet",
            "❌ Do NOT apply ice",
        ],
    },
    "general_injury": {
        "keywords": ["injury", "hurt", "pain", "wound", "injured"],
        "severity_default": "medium",
        "urgency": "moderate",
        "first_aid": [
            "1️⃣ Assess the injury — check for bleeding, swelling, deformity",
            "2️⃣ Clean the wound gently with clean water",
            "3️⃣ Apply antiseptic if available",
            "4️⃣ Cover with a clean bandage",
            "5️⃣ Apply ice wrapped in cloth for swelling",
            "6️⃣ Seek medical attention if pain persists or worsens",
        ],
        "do_not": [
            "❌ Do NOT ignore persistent pain",
            "❌ Do NOT apply unclean materials to wounds",
        ],
    },
}


def classify_injury(description: str, keywords: List[str] = None) -> Dict:
    """Classify injury type from description and keywords."""
    text = description.lower()
    all_words = set(text.split())
    if keywords:
        all_words.update([k.lower() for k in keywords])

    best_match = None
    best_score = 0

    for injury_type, profile in INJURY_PROFILES.items():
        score = sum(1 for kw in profile["keywords"] if kw in all_words or kw in text)
        if score > best_score:
            best_score = score
            best_match = injury_type

    if best_match is None or best_score == 0:
        best_match = "general_injury"

    profile = INJURY_PROFILES[best_match]
    confidence = min(1.0, best_score / 3.0)

    return {
        "injury_type": best_match,
        "severity": profile["severity_default"],
        "urgency": profile["urgency"],
        "confidence": round(confidence, 2),
        "first_aid": profile["first_aid"],
        "do_not": profile.get("do_not", []),
    }


def generate_doctor_summary(injury_type: str, description: str, severity: str) -> str:
    """Generate a doctor-ready summary for handoff."""
    return (
        f"PATIENT REPORT — AI Pre-Assessment\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Injury Classification: {injury_type.replace('_', ' ').title()}\n"
        f"Severity: {severity.upper()}\n"
        f"Patient Description: {description}\n"
        f"AI Confidence: Moderate-to-High\n"
        f"Pre-hospital Actions: First aid guidance provided via Saarthi Sentinel X\n"
        f"Recommendation: Immediate professional medical evaluation required\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Generated by Saarthi Sentinel X — Medical AI Module"
    )


def suggest_hospital(location: dict = None) -> str:
    """Suggest nearest hospital based on location (mock)."""
    if location:
        # In real system, would query geospatial DB
        return "AIIMS Hospital — 1.2km away (Estimated: 8 min by auto)"
    return "Nearest hospital — please enable location for accurate suggestion"
