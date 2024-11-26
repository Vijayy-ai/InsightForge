from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, List, Union, Literal
from datetime import datetime

class StatisticalSummary(BaseModel):
    mean: Optional[float]
    median: Optional[float]
    std: Optional[float]
    min: Optional[float]
    max: Optional[float]
    count: Optional[int]
    percentiles: Optional[Dict[str, float]]

class TimeSeriesAnalysis(BaseModel):
    trend: str
    seasonality: str
    outliers: List[float]
    forecast: Optional[List[float]]
    trends: Optional[Dict[str, Dict[str, Any]]]

class NumericalAnalysis(BaseModel):
    mean: float
    median: float
    std: float
    min: float
    max: float
    quartiles: tuple[float, float, float]

class CategoricalAnalysis(BaseModel):
    unique_values: int
    most_common: List[tuple[str, int]]
    distribution: Dict[str, int]

class DataQuality(BaseModel):
    completeness: Dict[str, Any]
    accuracy: Dict[str, Any]
    consistency: Dict[str, Any]

class VisualizationData(BaseModel):
    type: str
    data: List[Dict[str, Any]]
    layout: Dict[str, Any]

class Analysis(BaseModel):
    llm_analysis: str
    insights: Dict[str, StatisticalSummary]
    statistical_analysis: Dict[str, Optional[Union[TimeSeriesAnalysis, NumericalAnalysis, CategoricalAnalysis]]]
    data_quality: DataQuality

class EnhancedReport(BaseModel):
    id: str
    data_type: Literal['time_series', 'numerical', 'categorical', 'mixed']
    analysis: Analysis
    visualizations: List[VisualizationData]
    metadata: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @validator('data_type')
    def validate_data_type(cls, v):
        allowed_types = ['time_series', 'numerical', 'categorical', 'mixed']
        if v not in allowed_types:
            raise ValueError(f'data_type must be one of {allowed_types}')
        return v