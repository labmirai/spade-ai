from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.core.database import get_db

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    password_error,
)
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, RefreshRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    name = payload.name.strip()
    if not name or len(name) > 100:
        raise HTTPException(status_code=400, detail="Name is required")
    problem = password_error(payload.password, minimum=6)
    if problem:
        raise HTTPException(status_code=400, detail=problem)
    email = payload.email.strip().lower()
    phone = payload.phone.strip() if payload.phone else None
    if phone == "":
        phone = None
    if phone and len(phone) > 20:
        raise HTTPException(status_code=400, detail="Phone must be at most 20 characters")

    result = await db.execute(select(User).where(func.lower(User.email) == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=name,
        email=email,
        phone=phone,
        hashed_password=hash_password(payload.password),
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(func.lower(User.email) == payload.email.strip().lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    exc = HTTPException(status_code=401, detail="Invalid refresh token")
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise exc
        user_id = int(data.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise exc

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user