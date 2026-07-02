from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)


from utils.activity_logger import save_activity
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.dependencies import get_db
from utils.auth_middleware import get_current_user

from models.attendance import Attendance
from models.face_embedding import FaceEmbedding
from models.geofence import Geofence
from utils.timezone import now, today

from services.face_service import (
    extract_embedding_from_bytes,
    compare_embeddings
)

from utils.geofence import calculate_distance

from datetime import datetime, timedelta
from models.system_setting import SystemSetting

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
    
    
    contents = await file.read()

    current_embedding = extract_embedding_from_bytes(
        contents
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

    setting = db.query(
        SystemSetting
    ).first()

    threshold = float(
    setting.similarity_threshold
    )

    work_start = setting.work_start

    late_tolerance = setting.late_tolerance

    checkin_open = setting.checkin_open

    checkin_close = setting.checkin_close
        

    print(
        "SIMILARITY:",
        round(similarity, 4)
    )

    if similarity < threshold:
        return {
            "success": False,
            "message": "Wajah tidak cocok",
            "similarity": round(similarity, 4),
            "threshold": threshold
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
        Attendance.tanggal == today()
    ).first()

    if today_attendance:
        return {
            "success": False,
            "message": "Anda sudah melakukan check-in hari ini"
        }
    
    jam = now()

    print("NOW() :", jam)
    
    current_time = jam.time()

    # ==========================
    # VALIDASI JAM CHECK-IN
    # ==========================

    if current_time < checkin_open:

        return {
            "success": False,
            "message": "Jam check-in belum dibuka.",
            "allowed_time": {
                "open": str(checkin_open),
                "close": str(checkin_close)
            }
        }

    if current_time > checkin_close:

        return {
            "success": False,
            "message": "Jam check-in telah berakhir.",
            "allowed_time": {
                "open": str(checkin_open),
                "close": str(checkin_close)
            }
    }

    late_limit = datetime.combine(
        today(),
        work_start
    ) + timedelta(
        minutes=late_tolerance
    )

    late_limit = late_limit.replace(
        tzinfo=jam.tzinfo
    )

    status = (
        "HADIR"
        if jam <= late_limit
        else "TERLAMBAT"
    )

    print("=========================")
    print("BATAS TERLAMBAT :", late_limit)
    print("STATUS :", status)
    print("=========================")

    attendance = Attendance(
        user_id=user["user_id"],
        tanggal=today(),
        jam_masuk=jam,
        latitude=latitude,
        longitude=longitude,
        similarity_score=round(similarity, 4),
        status=status
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    save_activity(
    db,
    user["user_id"],
    "CHECK_IN"
    )

    return {
        "success": True,
        "message": "Check-in berhasil",
        "status":status,
        "similarity": round(similarity, 4),
        "threshold": threshold,
        "distance_meter": round(distance, 2)
    }


@router.post("/checkout/location")
def validate_checkout_location(

    latitude: float = Form(...),

    longitude: float = Form(...),

    db: Session = Depends(get_db)

):

    geofence = db.query(
        Geofence
    ).first()

    if not geofence:

        return {
            "success": False,
            "message": "Geofence belum dikonfigurasi"
        }

    distance = calculate_distance(

        latitude,

        longitude,

        float(geofence.latitude),

        float(geofence.longitude)

    )

    inside = distance <= geofence.radius_meter

    return {

        "success": True,

        "inside": inside,

        "distance_meter": round(distance, 2),

        "radius_meter": geofence.radius_meter

    }

@router.post("/checkout")
def checkout(

    latitude: float = Form(...),

    longitude: float = Form(...),

    db: Session = Depends(get_db),

    user=Depends(get_current_user)

):

    attendance = db.query(
        Attendance
    ).filter(
        Attendance.user_id == user["user_id"],
        Attendance.tanggal == today(),
        Attendance.jam_pulang == None
    ).first()

    if not attendance:
        return {
            "success": False,
            "message": "Anda belum check-in atau sudah check-out hari ini"
        }

    # ==========================
    # CEK JAM PULANG
    # ==========================

    setting = db.query(
        SystemSetting
    ).first()

    work_end = setting.work_end

    current_time = now().time()

    if current_time < work_end:

        return {
            "success": False,
            "message": "Belum memasuki jam pulang.",
            "checkout_time": str(work_end)
        }
    
    # ==========================
    # VALIDASI GEOFENCE CHECKOUT
    # ==========================

    geofence = db.query(
        Geofence
    ).first()

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

    if distance > geofence.radius_meter:

        return {
            "success": False,
            "message": "Check-out hanya dapat dilakukan di area kantor.",
            "distance_meter": round(distance, 2),
            "radius_meter": geofence.radius_meter
        }

    # ==========================
    # CHECKOUT
    # ==========================

    
    attendance.checkout_latitude = latitude

    attendance.checkout_longitude = longitude

    attendance.jam_pulang = now()

    db.commit()

    save_activity(
    db,
    user["user_id"],
    "CHECK_OUT"
    )

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
            
            "checkout_latitude":
            float(attendance.checkout_latitude)
            if attendance.checkout_latitude is not None
            else None,

            "checkout_longitude":
            float(attendance.checkout_longitude)
            if attendance.checkout_longitude is not None
            else None,


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
        Attendance.tanggal == today()
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
            "checkout_latitude":
            float(attendance.checkout_latitude)
            if attendance.checkout_latitude is not None
            else None,

            "checkout_longitude":
            float(attendance.checkout_longitude)
            if attendance.checkout_longitude is not None
            else None,
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
