from pydantic import BaseModel
from typing import Dict, Any, Optional, Union

class ReportRequest(BaseModel):
    data: Dict[str, Any]
    query: str
    format: str = "json"
    options: Optional[Dict[str, Any]] = None

class ReportResponse(BaseModel):
    status: str
    data: Union[Dict[str, Any], str]  # Can be JSON or base64 encoded PDF/HTML
    format: str 