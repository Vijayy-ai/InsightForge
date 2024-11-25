from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
from ..services.file_service import FileService
from ..utils.data_processor import DataProcessor
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload and process a file"""
    try:
        logger.info(f"Processing file: {file.filename}")
        
        file_service = FileService()
        data_processor = DataProcessor()
        
        # Read and process file
        file_content = await file_service.read_file(file)
        processed_data = data_processor.process_data(file_content)
        
        return {
            "status": "success",
            "processed_data": processed_data
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "File processing failed",
                "error": str(e),
                "filename": file.filename
            }
        ) 