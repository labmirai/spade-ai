"""map datasets

Revision ID: d4f8a1c6b2e9
Revises: c3a91e2b7d10
Create Date: 2026-11-13 20:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d4f8a1c6b2e9"
down_revision: Union[str, Sequence[str], None] = "c3a91e2b7d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "map_datasets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("dataset_key", sa.String(length=64), nullable=False),
        sa.Column("body", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("byte_size", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("dataset_key"),
    )


def downgrade() -> None:
    op.drop_table("map_datasets")
