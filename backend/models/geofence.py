from sqlalchemy import Column, BigInteger, String, Integer, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from database.base import Base


class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(BigInteger, primary_key=True, index=True)

    nama_lokasi = Column(String(100), nullable=False)

    latitude = Column(DECIMAL(10, 8), nullable=False)

    longitude = Column(DECIMAL(11, 8), nullable=False)

    radius_meter = Column(Integer, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )