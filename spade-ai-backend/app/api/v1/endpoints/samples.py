import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.soil_sample import SoilSample
from app.models.user import User
from app.schemas.sample import SampleResponse

router = APIRouter(prefix="/samples", tags=["Samples"])

MAX_PHOTO_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _public_url(image_path: str) -> str:
    return f"/uploads/{image_path}"


@router.get("", response_model=list[SampleResponse])
async def list_my_samples(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SoilSample)
        .where(SoilSample.user_id == current_user.id)
        .order_by(SoilSample.created_at.desc())
    )
    samples = result.scalars().all()
    return [
        SampleResponse(
            id=sample.id,
            place=sample.place,
            crop=sample.crop,
            notes=sample.notes,
            image_url=_public_url(sample.image_path),
            created_at=sample.created_at,
        )
        for sample in samples
    ]


@router.post("", response_model=SampleResponse, status_code=status.HTTP_201_CREATED)
async def create_sample(
    place: str = Form(...),
    crop: str | None = Form(None),
    notes: str | None = Form(None),
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    place = place.strip()
    if not place:
        raise HTTPException(status_code=400, detail="Place is required")

    extension = ALLOWED_TYPES.get(photo.content_type or "")
    if extension is None:
        raise HTTPException(status_code=400, detail="Photo must be a JPEG, PNG, or WebP image")

    contents = await photo.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Photo is empty")
    if len(contents) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=400, detail="Photo must be under 8 MB")

    relative = Path("soil") / f"{uuid.uuid4().hex}{extension}"
    destination = Path(settings.UPLOAD_DIR) / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(contents)

    sample = SoilSample(
        user_id=current_user.id,
        place=place,
        crop=(crop or "").strip() or None,
        notes=(notes or "").strip() or None,
        image_path=relative.as_posix(),
    )
    db.add(sample)
    await db.flush()
    await db.refresh(sample)
    return SampleResponse(
        id=sample.id,
        place=sample.place,
        crop=sample.crop,
        notes=sample.notes,
        image_url=_public_url(sample.image_path),
        created_at=sample.created_at,
    )
