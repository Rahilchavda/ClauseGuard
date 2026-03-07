from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router
from dotenv import load_dotenv
from routes.admin import admin_router

load_dotenv()

app = FastAPI(title="ClauseGuard API", version="1.0.0")

# Allow requests from Vercel frontend (and localhost for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",        # Vite dev server
        "https://*.vercel.app",          # your deployed frontend
        "https://clauseguard.vercel.app",        
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def health():
    return {"status": "ClauseGuard API is running"}