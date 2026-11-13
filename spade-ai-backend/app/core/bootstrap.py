import logging

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


async def ensure_admin() -> None:
    """Create the configured administrator if that email is not registered yet.

    An existing account with this email is promoted to admin. Its password is
    left unchanged.
    """
    email = settings.ADMIN_EMAIL.strip().lower()
    password = settings.ADMIN_PASSWORD
    if not email and not password:
        return
    if not email or not password:
        raise RuntimeError("Set both ADMIN_EMAIL and ADMIN_PASSWORD, or leave both empty")
    if len(password) < 8:
        raise RuntimeError("ADMIN_PASSWORD must be at least 8 characters")

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user is None:
            session.add(
                User(
                    name=(settings.ADMIN_NAME or "SPADE Admin").strip() or "SPADE Admin",
                    email=email,
                    hashed_password=hash_password(password),
                    role=UserRole.ADMIN,
                    is_active=True,
                )
            )
            await session.commit()
            logger.info("Created admin account %s", email)
            return

        if user.role != UserRole.ADMIN or not user.is_active:
            user.role = UserRole.ADMIN
            user.is_active = True
            await session.commit()
            logger.info("Promoted %s to admin", email)
