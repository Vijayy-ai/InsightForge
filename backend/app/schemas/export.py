from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ExportCustomizations(BaseModel):
    theme: Literal['light', 'dark'] = 'light'
    colors: Optional[List[str]] = None
    fontSize: Optional[int] = Field(default=12, ge=8, le=24)

class ExportOptions(BaseModel):
    format: Literal['json', 'pdf', 'html'] = 'json'
    includeVisualizations: bool = True
    includeTables: bool = True
    customizations: Optional[ExportCustomizations] = None

    class Config:
        json_schema_extra = {
            "example": {
                "format": "pdf",
                "includeVisualizations": True,
                "includeTables": True,
                "customizations": {
                    "theme": "light",
                    "colors": ["#1f77b4", "#ff7f0e", "#2ca02c"],
                    "fontSize": 12
                }
            }
        } 