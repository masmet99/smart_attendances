from sqlalchemy import (
    Column,
    BigInteger,
    String,
    TIMESTAMP,
    ForeignKey
)

from sqlalchemy.sql import func
from database.base import Base


class ActivityLog(Base):

    __tablename__ = "activity_logs"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=True
    )

    activity = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )