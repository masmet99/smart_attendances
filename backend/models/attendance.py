from sqlalchemy import (
    Column,
    BigInteger,
    Date,
    DateTime,
    DECIMAL,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func
from database.base import Base



class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    tanggal = Column(Date, nullable=False)

    jam_masuk = Column(DateTime)

    jam_pulang = Column(DateTime)

    latitude = Column(DECIMAL(10, 8), nullable=False)

    longitude = Column(DECIMAL(11, 8), nullable=False)

    similarity_score = Column(DECIMAL(5, 4))

    status = Column(
        Enum(
            "HADIR",
            "TERLAMBAT",
            "IZIN",
            "SAKIT"
        ),
        default="HADIR"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )