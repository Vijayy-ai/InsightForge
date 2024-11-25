from pydantic import BaseModel
from typing import Dict, Any, Optional

class UploadResponse(BaseModel):
    """Upload response schema"""
    status: str
    processed_data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class FileMetadata(BaseModel):
    """File metadata schema"""
    filename: str
    content_type: str
    size: int
    extension: str 