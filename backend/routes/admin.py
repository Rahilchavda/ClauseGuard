from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt, os

load_dotenv()
admin_router = APIRouter()

class LoginRequest(BaseModel):
    email:    str
    password: str
    role:     str = "Admin"

@admin_router.post("/admin/login")
def admin_login(body: LoginRequest):
    if body.email    != os.getenv("ADMIN_EMAIL") or \
       body.password != os.getenv("ADMIN_PASSWORD"):
        return {"success": False, "message": "Invalid credentials"}

    token = jwt.encode(
        {
            "email": body.email,
            "role":  body.role,
            "exp":   datetime.now(timezone.utc) + timedelta(days=7)
        },
        os.getenv("JWT_SECRET", "fallback-secret"),
        algorithm="HS256"
    )
    return {"success": True, "token": token}