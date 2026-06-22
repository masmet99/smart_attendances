from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from utils.security import hash_password
from utils.admin_middleware import admin_required

from database.dependencies import get_db

from schemas.user_schema import (
    UserCreate,
    UserUpdate,
    ResetPasswordRequest
)

from datetime import date
from sqlalchemy import func

from models.user import User
from models.attendance import Attendance

from typing import Optional
from datetime import date

from fastapi.responses import FileResponse
from openpyxl import Workbook
from datetime import date
import os

from datetime import timedelta

from models.geofence import Geofence
from pydantic import BaseModel

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

class GeofenceUpdate(BaseModel):

    nama_lokasi: str

    latitude: float

    longitude: float

    radius_meter: int


@router.get("/test")
def test_admin():
    return {
        "message": "Admin Route Working"
    }


@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    
    print("REQUEST USER =", user)
    print("ROLE =", user.role)

    new_user = User(
        nip=user.nip,
        nama=user.nama,
        jabatan=user.jabatan,
        unit_kerja=user.unit_kerja,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User created successfully",
        "id": new_user.id
    }


@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    users = db.query(User).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "nip": user.nip,
            "nama": user.nama,
            "jabatan": user.jabatan,
            "unit_kerja": user.unit_kerja,
            "role": user.role,
            "face_registered": user.face_registered,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        })

    return {
        "success": True,
        "total": len(result),
        "data": result
    }

@router.get("/users/export")
def export_users(

    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    users = db.query(User).all()

    wb = Workbook()

    ws = wb.active

    ws.title = "Data User"

    ws.append([
        "ID",
        "NIP",
        "Nama",
        "Jabatan",
        "Unit Kerja",
        "Role",
        "Status"
    ])

    for user in users:

        ws.append([

            user.id,

            user.nip,

            user.nama,

            user.jabatan,

            user.unit_kerja,

            user.role,

            "Aktif"
            if user.is_active
            else "Nonaktif"

        ])

    filename = "data_user.xlsx"

    wb.save(filename)

    return FileResponse(
        filename,
        filename=filename
    )

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    return {
        "success": True,
        "data": {
            "id": user.id,
            "nip": user.nip,
            "nama": user.nama,
            "jabatan": user.jabatan,
            "unit_kerja": user.unit_kerja,
            "role": user.role,
            "face_registered": user.face_registered,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    }



@router.put("/users/{user_id}")
def update_user(

    user_id: int,
    data: UserUpdate,

    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User tidak ditemukan"
        }

    if data.nama is not None:
        user.nama = data.nama

    if data.jabatan is not None:
        user.jabatan = data.jabatan

    if data.unit_kerja is not None:
        user.unit_kerja = data.unit_kerja

    if data.role is not None:
        user.role = data.role

    if data.password is not None:
        user.password = hash_password(
            data.password
        )

    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()

    return {
        "success": True,
        "message": "User berhasil diperbarui"
    }

@router.delete("/users/{user_id}")
def delete_user(

    user_id: int,

    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "success": False,
            "message": "User tidak ditemukan"
        }

    db.delete(user)

    db.commit()

    return {
        "success": True,
        "message": "User berhasil dihapus"
    }


@router.put(
    "/users/{user_id}/reset-password"
)
def reset_password(

    user_id: int,

    data: ResetPasswordRequest,

    db: Session = Depends(get_db),

    admin=Depends(
        admin_required
    )

):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "success": False,
            "message":
            "User tidak ditemukan"
        }

    user.password = hash_password(
        data.password
    )

    db.commit()

    return {
        "success": True,
        "message":
        "Password berhasil direset"
    }


# =====================================
# ADMIN - LIHAT SEMUA DATA ABSENSI
# =====================================

@router.get("/attendance")
def get_all_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    query = (
        db.query(
            Attendance,
            User
        )
        .join(
            User,
            Attendance.user_id == User.id
        )
    )

    # FILTER TANGGAL
    if start_date:
        query = query.filter(
            Attendance.tanggal >= start_date
        )

    if end_date:
        query = query.filter(
            Attendance.tanggal <= end_date
        )

    attendances = (
        query
        .order_by(
            desc(Attendance.tanggal)
        )
        .all()
    )

    result = []

    for attendance, user in attendances:

        result.append({
            "id": attendance.id,
            "nama": user.nama,
            "nip": user.nip,
            "jabatan": user.jabatan,
            "unit_kerja": user.unit_kerja,
            "tanggal": attendance.tanggal,
            "jam_masuk": attendance.jam_masuk,
            "jam_pulang": attendance.jam_pulang,
            "status": attendance.status,
            "latitude": float(attendance.latitude),
            "longitude": float(attendance.longitude),
            "similarity_score": float(attendance.similarity_score)
            if attendance.similarity_score is not None
            else None
        })

    return {
        "success": True,
        "total": len(result),
        "data": result
    }

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    total_users = db.query(User).count()

    registered_faces = db.query(User).filter(
        User.face_registered == True
    ).count()

    hadir_hari_ini = db.query(Attendance).filter(
        Attendance.tanggal == date.today()
    ).count()

    belum_absen = total_users - hadir_hari_ini

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "registered_faces": registered_faces,
            "hadir_hari_ini": hadir_hari_ini,
            "belum_absen_hari_ini": belum_absen
        }
    }

@router.put("/users/{user_id}/disable")
def disable_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User tidak ditemukan"
        }

    user.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "User berhasil dinonaktifkan"
    }

@router.put("/users/{user_id}/enable")
def enable_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User tidak ditemukan"
        }

    user.is_active = True

    db.commit()

    return {
        "success": True,
        "message": "User berhasil diaktifkan"
    }

@router.get("/attendance/export")
def export_attendance(

    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):

    attendances = (
        db.query(
            Attendance,
            User
        )
        .join(
            User,
            Attendance.user_id == User.id
        )
        .all()
    )

    wb = Workbook()

    ws = wb.active

    ws.title = "Attendance"

    ws.append([
        "ID",
        "NIP",
        "Nama",
        "Tanggal",
        "Jam Masuk",
        "Jam Pulang",
        "Status",
        "Similarity"
    ])

    for attendance, user in attendances:

        ws.append([
            attendance.id,
            user.nip,
            user.nama,
            str(attendance.tanggal),
            str(attendance.jam_masuk),
            str(attendance.jam_pulang),
            attendance.status,
            float(attendance.similarity_score)
            if attendance.similarity_score
            else None
        ])

    file_path = "attendance_report.xlsx"

    wb.save(file_path)

    return FileResponse(
        path=file_path,
        filename="attendance_report.xlsx",
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        )
    )

@router.get("/attendance-weekly")
def attendance_weekly(
    db: Session = Depends(get_db)
):

    days = [
        "Sen",
        "Sel",
        "Rab",
        "Kam",
        "Jum",
        "Sab",
        "Min"
    ]

    result = []

    for i in range(6, -1, -1):

        target_date = (
            date.today() -
            timedelta(days=i)
        )

        total = db.query(
            Attendance
        ).filter(
            Attendance.tanggal ==
            target_date
        ).count()

        result.append({

            "day":
            days[
                target_date.weekday()
            ],

            "total":
            total

        })

    return {
        "success": True,
        "data": result
    }

@router.get("/geofence")
def get_geofence(
    db: Session = Depends(get_db)
):

    geofence = db.query(
        Geofence
    ).first()

    if not geofence:

        return {
            "success": False
        }

    return {
        "success": True,
        "data": {
            "id": geofence.id,
            "nama_lokasi": geofence.nama_lokasi,
            "latitude": float(
                geofence.latitude
            ),
            "longitude": float(
                geofence.longitude
            ),
            "radius_meter":
                geofence.radius_meter
        }
    }

@router.put("/geofence")
def update_geofence(

    data: GeofenceUpdate,

    db: Session = Depends(get_db)

):

    geofence = db.query(
        Geofence
    ).first()

    if not geofence:

        geofence = Geofence(
            nama_lokasi=data.nama_lokasi,
            latitude=data.latitude,
            longitude=data.longitude,
            radius_meter=data.radius_meter
        )

        db.add(geofence)
        db.commit()

        return {
            "success": False,
            "message": "Geofence tidak ditemukan"
        }

    geofence.nama_lokasi = (
        data.nama_lokasi
    )

    geofence.latitude = (
        data.latitude
    )

    geofence.longitude = (
        data.longitude
    )

    geofence.radius_meter = (
        data.radius_meter
    )

    db.commit()

    return {
        "success": True,
        "message":
        "Geofence berhasil diperbarui"
    }