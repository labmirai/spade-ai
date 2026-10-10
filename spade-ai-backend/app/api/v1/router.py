"""API v1 router configuration"""
from fastapi import APIRouter

from app.api.v1.endpoints import health, users, auth

api_router = APIRouter(prefix="/api/v1")

# Include endpoint routers
api_router.include_router(health.router)
api_router.include_router(users.router)
api_router.include_router(auth.router)
