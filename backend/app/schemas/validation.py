from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List, Literal

class ReportGenerationParams(BaseModel):
    data: Dict[str, Any]
    query: str = Field(..., min_length=1)
    format: Literal['json', 'pdf', 'html'] = 'json'
    options: Optional[Dict[str, Any]] = None

    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty')
        return v.strip()

    @validator('data')
    def validate_data(cls, v):
        if not v:
            raise ValueError('Data cannot be empty')
        return v

class DataProcessingOptions(BaseModel):
    clean_missing_values: bool = False
    remove_outliers: bool = False
    normalize_data: bool = False
    aggregation_type: Optional[Literal['sum', 'mean', 'median']] = None
    timeframe: Optional[Literal['daily', 'weekly', 'monthly']] = None 