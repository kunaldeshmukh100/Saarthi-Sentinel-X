"""AI Services — Keyword extraction and distress detection for emergency text."""

import re
from typing import List, Dict

# Emergency keyword databases
DISASTER_KEYWORDS = {
    "flood": ["flood", "water", "drowning", "submerged", "rain", "overflow", "dam", "river", "waterlogging"],
    "fire": ["fire", "smoke", "burning", "flames", "blaze", "explosion", "gas_leak"],
    "earthquake": ["earthquake", "tremor", "collapse", "shaking", "building_collapse", "trapped"],
    "accident": ["accident", "crash", "collision", "hit", "vehicle", "road", "traffic"],
    "landslide": ["landslide", "mudslide", "slope", "hill", "debris"],
    "cyclone": ["cyclone", "storm", "hurricane", "wind", "tornado"],
}

WOMEN_SAFETY_KEYWORDS = {
    "stalking": ["following", "stalking", "chasing", "watching", "creepy", "stranger"],
    "harassment": ["harassment", "touching", "groping", "molest", "catcall", "eve_teasing"],
    "assault": ["assault", "attack", "hit", "beat", "violence", "abuse"],
    "threat": ["threat", "threatening", "scared", "afraid", "fear", "danger", "unsafe"],
    "distress": ["help", "bachao", "save", "emergency", "please", "someone", "alone"],
}

MEDICAL_KEYWORDS = {
    "bleeding": ["bleeding", "blood", "cut", "wound", "laceration", "gash"],
    "burn": ["burn", "scalded", "fire_injury", "chemical_burn", "hot", "boiling"],
    "fracture": ["fracture", "broken", "bone", "crack", "twisted", "sprain", "swollen"],
    "unconscious": ["unconscious", "fainted", "unresponsive", "passed_out", "not_breathing"],
    "cardiac": ["heart", "chest_pain", "cardiac", "heart_attack", "breathing_difficulty"],
    "poisoning": ["poison", "toxic", "vomiting", "chemical", "ingested"],
}

DISTRESS_PATTERNS = [
    r"\bhelp\b", r"\bplease\b.*\b(help|save)\b", r"\bsomeone\b.*\b(following|chasing)\b",
    r"\bcan'?t\s+breathe\b", r"\bin\s+danger\b", r"\bi'?m\s+scared\b",
    r"\bbachao\b", r"\bbachaao\b", r"\bmadad\b", r"\bkhatra\b",
    r"\bsos\b", r"\bemergency\b", r"\burgent\b",
]


def extract_keywords(text: str) -> Dict:
    """Extract emergency keywords from text and classify."""
    text_lower = text.lower()
    text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
    words = set(text_clean.split())

    found = {
        "disaster": [],
        "women_safety": [],
        "medical": [],
        "all_keywords": [],
    }

    for category, kw_list in DISASTER_KEYWORDS.items():
        matches = [w for w in kw_list if w in words or w in text_lower]
        if matches:
            found["disaster"].extend(matches)
            found["all_keywords"].extend(matches)

    for category, kw_list in WOMEN_SAFETY_KEYWORDS.items():
        matches = [w for w in kw_list if w in words or w in text_lower]
        if matches:
            found["women_safety"].extend(matches)
            found["all_keywords"].extend(matches)

    for category, kw_list in MEDICAL_KEYWORDS.items():
        matches = [w for w in kw_list if w in words or w in text_lower]
        if matches:
            found["medical"].extend(matches)
            found["all_keywords"].extend(matches)

    # Deduplicate
    for key in found:
        found[key] = list(set(found[key]))

    return found


def detect_distress(text: str) -> Dict:
    """Detect distress signals in text using pattern matching."""
    text_lower = text.lower()
    matches = []
    for pattern in DISTRESS_PATTERNS:
        if re.search(pattern, text_lower):
            matches.append(pattern)

    distress_score = min(1.0, len(matches) / 3.0)
    return {
        "is_distressed": distress_score > 0.3,
        "distress_score": round(distress_score, 2),
        "patterns_matched": len(matches),
    }


def mock_translate(text: str, source_lang: str = "hi", target_lang: str = "en") -> str:
    """Mock Hindi→English translation with common emergency phrases."""
    translations = {
        "bachao": "save me",
        "madad": "help",
        "aag lagi hai": "there is fire",
        "paani aa gaya": "water has come flooding",
        "mujhe dar lag raha hai": "I am feeling scared",
        "koi peecha kar raha hai": "someone is following me",
        "chot lagi hai": "I am injured",
        "khoon nikal raha hai": "I am bleeding",
        "gaon ke paas pul toot gaya hai": "bridge near village has collapsed",
    }
    text_lower = text.lower().strip()
    if text_lower in translations:
        return translations[text_lower]
    return text  # Return as-is if no translation found
