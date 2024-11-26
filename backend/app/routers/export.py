from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse
from typing import Dict, Any
from ..services.export_service import ExportService
from ..schemas.export import ExportOptions
from ..core.exceptions import ExportError
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/export")
async def export_report(
    data: Dict[str, Any] = Body(...),
    options: ExportOptions = Body(...)
):
    """Export report with specified options"""
    try:
        logger.info(f"Exporting report in format: {options.format}")
        
        export_service = ExportService()
        result = await export_service.export_report(data, options)
        
        if options.format in ['pdf', 'html']:
            return FileResponse(
                path=result["file_path"],
                media_type=result["mime_type"],
                filename=f"report_{data.get('id', 'export')}.{options.format}"
            )
            
        return {
            "status": "success",
            "data": result["data"],
            "format": options.format
        }
        
    except ExportError as e:
        logger.error(f"Export failed: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail={
                "message": str(e),
                "type": "export_error"
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error during export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Internal server error during export",
                "type": "internal_error"
            }
        )

@router.post("/export/visualization")
async def export_visualization(
    data: Dict[str, Any] = Body(...),
    format: str = Body(...)
):
    """Export visualization in specified format"""
    try:
        logger.info(f"Exporting visualization in format: {format}")
        
        export_service = ExportService()
        result = await export_service.export_visualization(data, format)
        
        return FileResponse(
            path=result["file_path"],
            media_type=result["mime_type"],
            filename=f"visualization.{format}"
        )
        
    except ExportError as e:
        logger.error(f"Visualization export failed: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail={
                "message": str(e),
                "type": "export_error"
            }
        ) 