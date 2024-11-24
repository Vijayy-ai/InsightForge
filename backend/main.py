from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, Response
import logging.config
from dotenv import load_dotenv
import os
import cohere
from app.data_processors.processor import DataProcessor
try:
    from app.report_generators.generator import ReportGenerator
except ModuleNotFoundError as e:
    raise ImportError("Required module not found. Please ensure all dependencies are installed.") from e
from typing import Dict, Any
import base64

# Load environment variables
load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("COHERE_API_KEY not found in environment variables")

# Initialize Cohere client
co = cohere.Client(COHERE_API_KEY)

# Initialize processors
data_processor = DataProcessor()
report_generator = ReportGenerator(co)

# Configure logging
logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
})

logger = logging.getLogger(__name__)

app = FastAPI(title="Data Analysis API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a file"""
    try:
        logger.info(f"Processing file: {file.filename}")
        result = await data_processor.process_file(file)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-report")
async def generate_report(
    payload: Dict[str, Any] = Body(...),
    format: str = Query("json", enum=["json", "html", "pdf"])
):
    """Generate analysis report"""
    try:
        logger.info(f"Received report generation request: format={format}")
        logger.debug(f"Payload: {payload}")

        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="Invalid payload format")
        
        if "data" not in payload:
            raise HTTPException(status_code=400, detail="Data is required in payload")
        
        if "query" not in payload:
            raise HTTPException(status_code=400, detail="Query is required in payload")

        try:
            report = await report_generator.generate_report(
                data=payload["data"],
                query=payload["query"],
                format=format
            )
            logger.info("Report generated successfully")
            
            # Handle different response formats
            if format == "pdf":
                if not report.get("content"):
                    raise HTTPException(status_code=500, detail="PDF generation failed")
                return Response(
                    content=base64.b64decode(report["content"]),
                    media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=report.pdf"}
                )
            elif format == "html":
                if not report.get("content"):
                    raise HTTPException(status_code=500, detail="HTML generation failed")
                return HTMLResponse(content=report["content"])
            else:
                return JSONResponse(content=report)

        except Exception as e:
            logger.error(f"Report generation error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "services": {
        "cohere": bool(COHERE_API_KEY),
        "processor": bool(data_processor),
        "generator": bool(report_generator)
    }} 