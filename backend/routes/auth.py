from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.security import verify_password
from database.dependencies import get_db
from schemas.auth_schema import LoginRequest
from models.user import User
from utils.jwt_handler import create_access_token
from utils.auth_middleware import get_current_user
from models.user import User
from utils.activity_logger import save_activity

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.nip == data.nip
    ).first()

    if not user:
        return {
            "success": False,
            "message": "NIP tidak ditemukan"
        }

    if not user.is_active:
        return {
        "success": False,
        "message": "Akun dinonaktifkan oleh administrator"
    }

    if not verify_password(
        data.password,
        user.password
    ):
        return {
            "success": False,
            "message": "Password salah"
        }

    token = create_access_token({
        "user_id": user.id,
        "nip": user.nip,
        "role": user.role
    })

    save_activity(
    db,
    user.id,
    "LOGIN"
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/profile")
def profile(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user = db.query(User).filter(
        User.id == user["user_id"]
    ).first()

    return {
        "message": "Token valid",
        "user": {
            "id": current_user.id,
            "nip": current_user.nip,
            "nama": current_user.nama,
            "role": current_user.role,
            "face_registered":
                current_user.face_registered,
            "is_active":
                current_user.is_active
        }
    }