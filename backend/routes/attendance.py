from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

import os

from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.dependencies import get_db
from utils.auth_middleware import get_current_user

from models.attendance import Attendance
from models.face_embedding import FaceEmbedding
from models.geofence import Geofence

from services.face_service import (
    extract_embedding,
    compare_embeddings
)

from utils.geofence import calculate_distance

from datetime import datetime, date

import json


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.get("/test")
def test_attendance():
    return {
        "message": "Attendance Route Working"
    }


@router.post("/checkin")
async def checkin(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    
    
    
    os.makedirs(
    "uploads/attendance",
    exist_ok=True
    )   

    file_path = f"uploads/attendance/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    current_embedding = extract_embedding(
        file_path
    )

    if current_embedding is None:
        return {
            "success": False,
            "message": "Wajah tidak terdeteksi"
        }

    saved_faces = db.query(
        FaceEmbedding
    ).filter(
        FaceEmbedding.user_id == user["user_id"]
    ).all()

    if len(saved_faces) == 0:
        return {
            "success": False,
            "message": "Wajah belum terdaftar"
        }

    best_similarity = 0

    for face in saved_faces:

        registered_embedding = json.loads(
            face.embedding
        )

        similarity = compare_embeddings(
            current_embedding,
            registered_embedding
        )

        best_similarity = max(
            best_similarity,
            similarity
        )

    similarity = best_similarity
    

    print(
        "SIMILARITY:",
        round(similarity, 4)
    )

    if similarity < 0.65:
        return {
            "success": False,
            "message": "Wajah tidak cocok",
            "similarity": round(similarity, 4)
        }

    # ==========================
    # VALIDASI GEOFENCE
    # ==========================

    geofence = db.query(
        Geofence
    ).first()

    print("================================")
    print("LAT DB :", geofence.latitude)
    print("LNG DB :", geofence.longitude)
    print("RADIUS :", geofence.radius_meter)
    print("================================")

    if not geofence:
        return {
            "success": False,
            "message": "Geofence belum dikonfigurasi"
        }

    distance = calculate_distance(
        float(latitude),
        float(longitude),
        float(geofence.latitude),
        float(geofence.longitude)
    )

    print("USER LAT :", latitude)
    print("USER LNG :", longitude)
    print("DISTANCE :", distance)

    if distance > geofence.radius_meter:
        return {
            "success": False,
            "message": "Anda berada di luar area kantor",
            "distance_meter": round(distance, 2),
            "radius_meter": geofence.radius_meter
        }

    # ==========================
    # CEK ABSENSI HARI INI
    # ==========================

    today_attendance = db.query(
        Attendance
    ).filter(
        Attendance.user_id == user["user_id"],
        Attendance.tanggal == date.today()
    ).first()

    if today_attendance:
        return {
            "success": False,
            "message": "Anda sudah melakukan check-in hari ini"
        }

    attendance = Attendance(
        user_id=user["user_id"],
        tanggal=date.today(),
        jam_masuk=datetime.now(),
        latitude=latitude,
        longitude=longitude,
        similarity_score=round(similarity, 4),
        status="HADIR"
    )

    db.add(attendance)
    db.commit()

    return {
        "success": True,
        "message": "Check-in berhasil",
        "similarity": round(similarity, 4),
        "distance_meter": round(distance, 2)
    }


@router.post("/checkout")
def checkout(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    attendance = db.query(
        Attendance
    ).filter(
        Attendance.user_id == user["user_id"],
        Attendance.tanggal == date.today(),
        Attendance.jam_pulang == None
    ).first()

    if not attendance:
        return {
            "success": False,
            "message": "Anda belum check-in atau sudah check-out hari ini"
        }

    attendance.jam_pulang = datetime.now()

    db.commit()

    return {
        "success": True,
        "message": "Check-out berhasil",
        "jam_pulang": attendance.jam_pulang
    }


@router.get("/history")
def attendance_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    attendances = db.query(
        Attendance
    ).filter(
        Attendance.user_id == user["user_id"]
    ).order_by(
        desc(Attendance.tanggal)
    ).all()

    result = []

    for attendance in attendances:
        result.append({
            "id": attendance.id,
            "tanggal": attendance.tanggal,
            "jam_masuk": attendance.jam_masuk,
            "jam_pulang": attendance.jam_pulang,
            "latitude": float(attendance.latitude),
            "longitude": float(attendance.longitude),
            "similarity_score": float(attendance.similarity_score)
            if attendance.similarity_score is not None else None,
            "status": attendance.status
        })

    return {
        "success": True,
        "total": len(result),
        "data": result
    }

@router.get("/today")
def today_attendance(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    attendance = db.query(
        Attendance
    ).filter(
        Attendance.user_id == user["user_id"],
        Attendance.tanggal == date.today()
    ).first()

    if not attendance:
        return {
            "success": True,
            "checked_in": False,
            "checked_out": False,
            "data": None
        }

    return {
        "success": True,
        "checked_in": attendance.jam_masuk is not None,
        "checked_out": attendance.jam_pulang is not None,
        "data": {
            "id": attendance.id,
            "tanggal": attendance.tanggal,
            "jam_masuk": attendance.jam_masuk,
            "jam_pulang": attendance.jam_pulang,
            "status": attendance.status,
            "similarity_score": float(attendance.similarity_score)
            if attendance.similarity_score is not None
            else None
        }
    }

@router.put("/geofence")
def update_geofence(

    nama_lokasi: str,

    latitude: float,

    longitude: float,

    radius_meter: int,

    db: Session = Depends(get_db)

):

    geofence = db.query(
        Geofence
    ).first()

    geofence.nama_lokasi = nama_lokasi

    geofence.latitude = latitude

    geofence.longitude = longitude

    geofence.radius_meter = radius_meter

    db.commit()

    return {
        "success": True,
        "message":
        "Geofence berhasil diperbarui"
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
            "success": False,
            "message": "Geofence belum diatur"
        }

    return {
        "success": True,
        "data": {
            "nama_lokasi": geofence.nama_lokasi,
            "latitude": float(geofence.latitude),
            "longitude": float(geofence.longitude),
            "radius_meter": geofence.radius_meter
        }
    }
