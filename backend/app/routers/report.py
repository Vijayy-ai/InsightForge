from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from fastapi.responses import JSONResponse, FileResponse
from ..services.report_service import ReportService
from ..core.config import get_settings
from ..core.exceptions import ReportGenerationError
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()

# Define response models
class ReportResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    format: str
    type: str

class AnalysisResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    type: str

@router.post("/report/generate", response_model=None)
async def generate_report(
    data: Dict[str, Any] = Body(...),
    query: str = Body(...),
    format: str = Body(default="json")
):
    """Generate a report based on the provided data and query"""
    try:
        logger.info(f"Generating report with format: {format}")
        logger.info(f"Query: {query}")
        
        report_service = ReportService()
        report = await report_service.generate_report(data, query, format)
        
        if format == "pdf":
            return FileResponse(
                report["file_path"],
                media_type="application/pdf",
                filename=f"report_{report['timestamp']}.pdf"
            )
        
        return JSONResponse(content={
            "status": "success",
            "data": report,
            "format": format,
            "type": "report"
        })
        
    except ReportGenerationError as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail={
                "message": str(e),
                "type": "report_generation_error",
                "query": query
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in report generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Internal server error during report generation",
                "type": "internal_error"
            }
        )

@router.post("/report/analyze", response_model=AnalysisResponse)
async def analyze_data(
    data: Dict[str, Any] = Body(...),
    analysis_type: str = Body(default="general")
):
    """Analyze data and return insights"""
    try:
        logger.info(f"Analyzing data with type: {analysis_type}")
        
        report_service = ReportService()
        analysis = await report_service.analyze_data(data, analysis_type)
        
        return {
            "status": "success",
            "data": analysis,
            "type": "analysis"
        }
        
    except Exception as e:
        logger.error(f"Data analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": str(e),
                "type": "analysis_error"
            }
        )

@router.post("/report/export")
async def export_report(
    data: Dict[str, Any] = Body(...),
    format: str = Body(...),
    template: str = Body(default="default")
):
    """Export report in specified format"""
    try:
        logger.info(f"Exporting report in format: {format}")
        
        report_service = ReportService()
        export_result = await report_service.export_report(data, format, template)
        
        return FileResponse(
            export_result["file_path"],
            media_type=export_result["media_type"],
            filename=export_result["filename"]
        )
        
    except Exception as e:
        logger.error(f"Report export failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": str(e),
                "type": "export_error"
            }
        ) 