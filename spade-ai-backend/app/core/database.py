import ssl
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Clean DATABASE_URL by removing asyncpg-unsupported parameters
def get_clean_database_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.query:
        params = parse_qs(parsed.query, keep_blank_values=True)
        unsupported = {"sslmode", "channel_binding"}
        for param in unsupported:
            params.pop(param, None)
        new_query = urlencode(params, doseq=True)
        parsed = parsed._replace(query=new_query)
    return urlunparse(parsed)

clean_database_url = get_clean_database_url(settings.DATABASE_URL)

# Engine — pool_pre_ping keeps Neon's serverless connections healthy
engine = create_async_engine(
    clean_database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=settings.DEBUG,
    connect_args={"ssl": ssl.create_default_context()} if settings.DATABASE_SSL else {},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

class Base(DeclarativeBase):
    """All ORM models inherit from this."""
    pass

# Dependency — inject into route handlers
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise