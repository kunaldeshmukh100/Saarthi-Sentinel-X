# 🛡️ Saarthi Sentinel X

## Unified AI Safety & Emergency Intelligence System

> *"A multimodal, offline-first AI safety system that detects danger, assists victims, and orchestrates response across disaster, medical, and personal safety scenarios in real-time."*

### 🔥 Core Capabilities

| Module | Description |
|--------|-------------|
| 🚨 **Disaster Response** | Flood, fire, earthquake detection with AI severity scoring |
| 👩 **Women Safety AI** | Panic button, voice trigger, stalking detection, safe zone routing |
| 🏥 **Medical AI** | Injury classification, first aid guidance, hospital finder |
| 📡 **Offline Emergency** | Works WITHOUT internet — local storage, auto-sync |
| 🧠 **Multimodal Fusion** | Combines voice, image, text, location into unified risk assessment |
| 📊 **Live Dashboard** | Real-time incident map with severity heatmap |

---

### 🚀 Quick Start

#### Backend (FastAPI)
```bash
cd saarthi-sentinel-x
pip install -r requirements.txt
cd backend
set PYTHONPATH=.. && python -m uvicorn app.main:app --port 8000
```

#### Frontend (Next.js)
```bash
cd saarthi-sentinel-x/frontend
npm install
npm run dev
```

Open:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

### 🏗️ Architecture

```
User Input → AI Perception → Context Engine → Risk Engine → Response Engine
    │              │               │              │              │
  Voice         NLP/Vision    Location+Time   Severity      Alerts
  Image         Keywords      Environment     Confidence    Guidance
  Text          Distress      Context         Classification Dispatch
  SOS Button    Translation                                  First Aid
```

### 📁 Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 14 + Tailwind CSS + Framer Motion
- **Maps**: Leaflet (dark theme)
- **AI**: Rule-based multimodal fusion engine (no heavy ML deps)
- **Storage**: In-memory (hackathon MVP)

---

### 🎬 Demo Script

1. **Landing Page** → Show system overview and architecture
2. **SOS Emergency** → Press panic button → See risk assessment + safe zone
3. **Medical AI** → Select "Bleeding Wound" → Get first aid steps
4. **Report Incident** → Type "Fire in market" → See AI classification
5. **Dashboard** → Show real-time case feed with severity
6. **Map** → Show incidents + safe zones on dark map

---

*Built for national-level safety infrastructure* 🇮🇳
