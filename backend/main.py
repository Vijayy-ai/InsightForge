from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import upload, database, report
import logging

settings = get_settings()

app = FastAPI(
    title="InsightForge API",
    description="API for data analysis and report generation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router without prefix
api_router = APIRouter()

# Include route modules without prefix
api_router.include_router(upload.router)
api_router.include_router(database.router)
api_router.include_router(report.router)

# Mount the API router with the /api prefix
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,  # Use the app directly
        host="0.0.0.0",
        port=8000,
        reload=True
    )