from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any
from ..services.report_service import ReportService
from ..core.exceptions import ReportGenerationError
import logging
from datetime import datetime

router = APIRouter(tags=["report"])
logger = logging.getLogger(__name__)

@router.post("/report/generate")
async def generate_report(
    request: Dict[str, Any]
) -> Response:
    """Generate a report from the provided data"""
    try:
        logger.info(f"Received report generation request: {request.get('format', 'json')}")
        
        data = request.get("data")
        query = request.get("query")
        format = request.get("format", "json")
        
        if not data:
            raise HTTPException(
                status_code=400,
                detail="Data is required"
            )
        
        if not query:
            raise HTTPException(
                status_code=400,
                detail="Query is required"
            )

        report_service = ReportService()
        result = await report_service.generate_report(data, query, format)

        if format == "json":
            return {
                "status": "success",
                "data": result
            }
        elif format == "pdf":
            return Response(
                content=result,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                }
            )
        else:  # HTML
            return Response(
                content=result,
                media_type="text/html"
            )

    except ReportGenerationError as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in report generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 
        