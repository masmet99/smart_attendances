from sqlalchemy import (
    Column,
    BigInteger,
    Text,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func
from database.base import Base


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    pose = Column(
        Enum(
            "front",
            "left",
            "right",
            "mouth_open",
            "blink",
            "smile"
        ),
        nullable=False
    )

    embedding = Column(Text, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )