from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from ..services.database_service import DatabaseService
from ..schemas.database import DatabaseConnectionRequest, DatabaseResponse
from ..core.config import get_settings
from ..utils.data_processor import DataProcessor

router = APIRouter(tags=["database"])
settings = get_settings()

@router.post("/connect", response_model=DatabaseResponse)
async def connect_database(request: DatabaseConnectionRequest):
    """Connect to database and execute query"""
    try:
        db_service = DatabaseService()
        data_processor = DataProcessor()
        
        # Connect and execute query
        raw_data = await db_service.connect(request.dict())
        
        # Process the data
        processed_data = data_processor.process_data(raw_data)
        
        # Determine data type
        data_type = data_processor.determine_data_type(processed_data["processed_data"])
        
        return DatabaseResponse(
            status="success",
            data={
                "type": "structured",
                "data": processed_data["processed_data"],
                "data_type": data_type,
                "metadata": processed_data["metadata"]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 