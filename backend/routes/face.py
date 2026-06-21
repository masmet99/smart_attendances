from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends
)

from sqlalchemy.orm import Session
from database.dependencies import get_db

from utils.auth_middleware import get_current_user

from services.face_service import (
    extract_embedding,
    compare_embeddings
)

from models.face_embedding import FaceEmbedding
from models.user import User

import json


router = APIRouter(
    prefix="/face",
    tags=["Face Recognition"]
)


@router.get("/test")
def test_face():
    return {
        "message": "Face Route Working"
    }


@router.post("/register")
async def register_face(
    pose: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    file_path = f"uploads/register/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    embedding = extract_embedding(file_path)

    if embedding is None:
        return {
            "success": False,
            "message": "Wajah tidak terdeteksi"
        }
    
    if pose == "front":

        db.query(
            FaceEmbedding
        ).filter(
            FaceEmbedding.user_id ==
            user["user_id"]
        ).delete()

        db.commit()

        print("================================")
        print("POSE DITERIMA :", pose)
        print("USER :", user["user_id"])
        print("================================")

    face_data = FaceEmbedding(
        user_id=user["user_id"],
        pose=pose,
        embedding=json.dumps(embedding)
    )

    db.add(face_data)

    current_user = db.query(User).filter(
        User.id == user["user_id"]
    ).first()

    current_user.face_registered = True

    db.commit()

    return {
        "success": True,
        "message": "Registrasi wajah berhasil"
    }


@router.post("/verify")
async def verify_face(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    file_path = f"uploads/register/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    current_embedding = extract_embedding(file_path)

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
    

    return {
        "success": True,
        "similarity": round(similarity, 4),
        "match": similarity >= 0.65
    }