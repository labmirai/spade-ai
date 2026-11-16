"""map reader role

Revision ID: e7a1c4b82f30
Revises: d4f8a1c6b2e9
Create Date: 2026-11-13 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e7a1c4b82f30"
down_revision: Union[str, Sequence[str], None] = "d4f8a1c6b2e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'MAP'")


def downgrade() -> None:
    op.execute("UPDATE users SET role = 'USER' WHERE role::text = 'MAP'")
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'USER')")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::text::userrole")
    op.execute("DROP TYPE userrole_old")
