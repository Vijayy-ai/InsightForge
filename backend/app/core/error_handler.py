from fastapi import Request, status
from fastapi.responses import JSONResponse
from .exceptions import (
    ReportGenerationError,
    DataProcessingError,
    ValidationError
)
import logging

logger = logging.getLogger(__name__)

async def report_generation_error_handler(request: Request, exc: ReportGenerationError):
    logger.error(f"Report generation error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc), "type": "report_generation_error"}
    )

async def data_processing_error_handler(request: Request, exc: DataProcessingError):
    logger.error(f"Data processing error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc), "type": "data_processing_error"}
    )

async def validation_error_handler(request: Request, exc: ValidationError):
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "type": "validation_error"}
    )

def register_error_handlers(app):
    app.add_exception_handler(ReportGenerationError, report_generation_error_handler)
    app.add_exception_handler(DataProcessingError, data_processing_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler) 