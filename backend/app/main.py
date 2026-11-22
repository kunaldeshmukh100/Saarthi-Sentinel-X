"""Saarthi Sentinel X — FastAPI Backend Entry Point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.router import api_router
from app.db.memory_store import store
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed demo data on startup."""
    store.seed_demo_data()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Unified AI Safety & Emergency Intelligence System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "system": "Saarthi Sentinel X", "version": "1.0.0"}
