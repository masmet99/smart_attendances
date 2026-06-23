from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    nip: str
    nama: str
    jabatan: Optional[str] = None
    unit_kerja: Optional[str] = None
    password: str
    role: str = "user"


class UserUpdate(BaseModel):
    nip: Optional[str] = None
    nama: Optional[str] = None
    jabatan: Optional[str] = None
    unit_kerja: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    nip: str
    nama: str
    jabatan: Optional[str]
    unit_kerja: Optional[str]
    role: str
    face_registered: bool
    is_active: bool

    class Config:
        from_attributes = True

class ResetPasswordRequest(BaseModel):
    password: str