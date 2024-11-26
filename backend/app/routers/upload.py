from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any
from ..services.file_service import FileService
import logging

logger = logging.getLogger(__name__)

# Remove the prefix from individual routers
router = APIRouter(tags=["upload"])

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
) -> Dict[str, Any]:
    """Upload and process a file with background processing for large files"""
    try:
        logger.info(f"Received file upload request: {file.filename}")
        
        # Validate file size
        if not hasattr(file, 'size'):
            content = await file.read()
            size = len(content)
            await file.seek(0)
        else:
            size = file.size

        if size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
            
        file_service = FileService()
        processed_data = await file_service.read_file(file)
        
        return {
            "status": "success",
            "processed_data": processed_data
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 