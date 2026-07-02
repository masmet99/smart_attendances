from sqlalchemy import (
    Column,
    BigInteger,
    Enum,
    DateTime,
    ForeignKey
)

from database.base import Base

from utils.timezone import now


class ActivityLog(Base):

    __tablename__ = "activity_logs"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    activity = Column(

        Enum(

            "LOGIN",

            "CHECK_IN",

            "CHECK_OUT"

        ),

        nullable=False

    )

    created_at = Column(

        DateTime,

        default=now

    )