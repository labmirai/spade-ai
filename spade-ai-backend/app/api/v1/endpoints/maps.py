"""Jashore soil map for map readers and administrators. Documents are read from Postgres."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_map_user
from app.core.map_store import SERVED_KEYS
from app.models.map_dataset import MapDataset
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/maps", tags=["Maps"])

PRIVATE_HEADERS = {
    "Cache-Control": "private, no-store",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}


async def _document(dataset_key: str, db: AsyncSession, user: User) -> JSONResponse:
    result = await db.execute(select(MapDataset.body).where(MapDataset.dataset_key == dataset_key))
    body = result.scalar_one_or_none()
    if body is None:
        raise HTTPException(status_code=404, detail="Map dataset is not available")
    logger.info("map dataset served user_id=%s key=%s", user.id, dataset_key)
    return JSONResponse(content=body, headers=PRIVATE_HEADERS)


@router.get("/jessore/summary")
async def jessore_summary(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_map_user),
):
    return await _document(SERVED_KEYS["summary"], db, user)


@router.get("/jessore/plan")
async def jessore_plan(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_map_user),
):
    return await _document(SERVED_KEYS["plan"], db, user)


@router.get("/jessore/layers/{layer}")
async def jessore_layer(
    layer: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_map_user),
):
    dataset_key = SERVED_KEYS.get(layer)
    if dataset_key is None:
        raise HTTPException(status_code=404, detail="Unknown map layer")
    return await _document(dataset_key, db, user)
