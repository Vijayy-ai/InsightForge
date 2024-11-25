from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import upload, database, report
from app.core.error_handler import register_error_handlers
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Data Analysis API",
    description="API for data analysis and visualization",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with proper prefixes
app.include_router(upload.router, prefix="/api")
app.include_router(database.router, prefix="/api")
app.include_router(report.router, prefix="/api")

# Register error handlers
register_error_handlers(app)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "debug": settings.DEBUG,
        "allowed_hosts": settings.allowed_hosts_list
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.DEBUG else False
    ) 