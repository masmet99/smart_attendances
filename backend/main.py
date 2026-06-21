from fastapi import FastAPI
from database.connection import engine
from routes.face import router as face_router
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.attendance import router as attendance_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(face_router)
app.include_router(attendance_router)

@app.get("/")
def root():
    return {
        "message": "Smart Attendance API Running"
    }