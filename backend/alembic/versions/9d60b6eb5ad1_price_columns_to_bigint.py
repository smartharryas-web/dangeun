"""price columns to bigint

Revision ID: 9d60b6eb5ad1
Revises: bd4e2d56a068
Create Date: 2026-11-27 16:18:43.551388

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d60b6eb5ad1'
down_revision: Union[str, Sequence[str], None] = 'bd4e2d56a068'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 가격 칸: INTEGER(약 21억까지) → BIGINT. 비싼 물건(30억 등)을 올리면 서버가 터지던 문제
    for table in ('products', 'offers', 'temp_products'):
        op.alter_column(table, 'price', type_=sa.BigInteger(), existing_type=sa.Integer())


def downgrade() -> None:
    """Downgrade schema."""
    for table in ('products', 'offers', 'temp_products'):
        op.alter_column(table, 'price', type_=sa.Integer(), existing_type=sa.BigInteger())
