"""soil samples

Revision ID: c3a91e2b7d10
Revises: 49e791607366
Create Date: 2026-10-10 21:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3a91e2b7d10"
down_revision: Union[str, Sequence[str], None] = "49e791607366"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "soil_samples",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("place", sa.String(length=200), nullable=False),
        sa.Column("crop", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("image_path", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_soil_samples_user_id", "soil_samples", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_soil_samples_user_id", table_name="soil_samples")
    op.drop_table("soil_samples")
