from sqlalchemy import (
    Column,
    BigInteger,
    Time,
    Integer,
    DECIMAL
)

from database.base import Base


class SystemSetting(Base):

    __tablename__ = "system_settings"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    work_start = Column(
        Time,
        nullable=False
    )

    work_end = Column(
        Time,
        nullable=False
    )

    late_tolerance = Column(
        Integer,
        nullable=False
    )

    similarity_threshold = Column(
        DECIMAL(3,2),
        nullable=False
    )