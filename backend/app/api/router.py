"""Central API Router — aggregates all route modules."""

from fastapi import APIRouter

from app.api.routes import reports, emergency, medical, dashboard, map_routes

api_router = APIRouter()

api_router.include_router(reports.router)
api_router.include_router(emergency.router)
api_router.include_router(medical.router)
api_router.include_router(dashboard.router)
api_router.include_router(map_routes.router)
