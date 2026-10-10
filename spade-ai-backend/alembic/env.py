import asyncio
import ssl
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

from app.core.config import settings
from app.core.database import Base, get_clean_database_url

# Import all models here so Alembic can detect them
from app.models import soil_sample, user  # noqa: F401

# Alembic Config object
config = context.config

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata

# Load DB URL from settings (use clean URL without sslmode/channel_binding)
clean_url = get_clean_database_url(settings.DATABASE_URL)
config.set_main_option("sqlalchemy.url", clean_url)


def run_migrations_offline() -> None:
    """Run migrations without a DB connection (generates SQL)."""
    context.configure(
        url=clean_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations with an async engine."""
    connectable = create_async_engine(
        clean_url,
        poolclass=pool.NullPool,
        connect_args={"ssl": ssl.create_default_context()} if settings.DATABASE_SSL else {},
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()