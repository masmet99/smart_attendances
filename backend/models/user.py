from sqlalchemy import Column, BigInteger, String, Boolean, Enum, TIMESTAMP
from sqlalchemy.sql import func
from database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)

    nip = Column(String(50), unique=True, nullable=False)

    nama = Column(String(100), nullable=False)

    jabatan = Column(String(100))

    unit_kerja = Column(String(100))

    password = Column(String(255), nullable=False)

    role = Column(
        Enum("admin", "user"),
        default="user"
    )

    face_registered = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )