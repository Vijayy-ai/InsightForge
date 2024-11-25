from llama_index.core import VectorStoreIndex, Document, ServiceContext
from llama_index.llms.cohere import Cohere
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from typing import Dict, Any, List, TypedDict, Optional, Union
from dataclasses import dataclass
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller
from scipy import stats
import warnings

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)

@dataclass
class TrendAnalysis:
    mean: float
    std: float
    trend: str
    trend_strength: float
    trend_components: Dict[str, List[float]]

class TimeSeriesResult(TypedDict):
    type: str
    trends: Dict[str, TrendAnalysis]
    stationarity: Dict[str, Dict[str, Any]]
    change_points: Dict[str, Dict[str, Any]]

class NumericalResult(TypedDict):
    type: str
    statistics: Dict[str, Dict[str, float]]
    correlations: Dict[str, Dict[str, float]]

class CategoricalResult(TypedDict):
    type: str
    frequencies: Dict[str, Dict[str, int]]

AnalysisResult = Union[TimeSeriesResult, NumericalResult, CategoricalResult]

class AnalysisAgent:
    def __init__(self, llm):
        self.llm = llm
        self.service_context = ServiceContext.from_defaults(llm=self.llm)
        
    async def analyze_data(self, data: pd.DataFrame, query: str) -> AnalysisResult:
        """Perform advanced data analysis with comprehensive insights"""
        try:
            # Data quality check
            quality_report = self._check_data_quality(data)
            
            # Main analysis based on data type
            if self._is_time_series(data):
                analysis = await self._analyze_time_series(data, query)
            elif self._has_numerical_data(data):
                analysis = await self._analyze_numerical(data, query)
            else:
                analysis = await self._analyze_categorical(data, query)
            
            # Add data quality report to results
            analysis["data_quality"] = quality_report
            return analysis
                
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise Exception(f"Analysis failed: {str(e)}")

    def _check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Comprehensive data quality assessment"""
        quality_report = {
            "completeness": {},
            "uniqueness": {},
            "validity": {}
        }
        
        # Completeness check
        missing_values = df.isnull().sum()
        quality_report["completeness"] = {
            "missing_values_count": missing_values.to_dict(),
            "missing_percentage": (missing_values / len(df) * 100).to_dict()
        }
        
        # Uniqueness check
        quality_report["uniqueness"] = {
            col: {
                "unique_count": df[col].nunique(),
                "duplicate_percentage": (1 - df[col].nunique() / len(df)) * 100
            } for col in df.columns
        }
        
        # Validity check (for numeric columns)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        quality_report["validity"]["numeric_columns"] = {
            col: {
                "zeros_percentage": (df[col] == 0).mean() * 100,
                "negative_percentage": (df[col] < 0).mean() * 100 if col in numeric_cols else None
            } for col in df.columns
        }
        
        return quality_report

    async def _analyze_time_series(self, df: pd.DataFrame, query: str) -> AnalysisResult:
        """Enhanced time series analysis with forecasting"""
        results = {
            "type": "time_series",
            "trends": {},
            "stationarity": {},
            "change_points": {}
        }
        
        date_col = df.select_dtypes(include=['datetime64']).columns[0]
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            # Advanced trend analysis
            decomposition = seasonal_decompose(
                df[col], period=min(len(df), 7), model='additive'
            )
            
            results["trends"][col] = {
                "mean": df[col].mean(),
                "std": df[col].std(),
                "trend": "increasing" if df[col].diff().mean() > 0 else "decreasing",
                "trend_strength": abs(df[col].diff().mean() / df[col].std()),
                "trend_components": {
                    "trend": decomposition.trend.dropna().tolist(),
                    "seasonal": decomposition.seasonal.dropna().tolist(),
                    "residual": decomposition.resid.dropna().tolist()
                }
            }
            
            # Stationarity test
            adf_test = adfuller(df[col].dropna())
            results["stationarity"][col] = {
                "is_stationary": adf_test[1] < 0.05,
                "p_value": adf_test[1],
                "critical_values": adf_test[4]
            }
            
            # Change point detection
            results["change_points"][col] = self._detect_change_points(df[col])
        
        return results

    def _detect_change_points(self, series: pd.Series) -> Dict[str, Any]:
        """Detect significant changes in time series"""
        rolling_mean = series.rolling(window=5).mean()
        rolling_std = series.rolling(window=5).std()
        
        # Detect points where the change is more than 2 standard deviations
        significant_changes = np.where(
            abs(series - rolling_mean) > 2 * rolling_std
        )[0].tolist()
        
        return {
            "significant_changes": significant_changes,
            "change_magnitude": [
                float(series.iloc[i]) for i in significant_changes
            ] if significant_changes else []
        }
    
    def _is_time_series(self, df: pd.DataFrame) -> bool:
        """Check if data contains time series"""
        return any(pd.api.types.is_datetime64_any_dtype(df[col]) for col in df.columns)
    
    def _has_numerical_data(self, df: pd.DataFrame) -> bool:
        """Check if data contains numerical columns"""
        return any(pd.api.types.is_numeric_dtype(df[col]) for col in df.columns)
    
    async def _analyze_numerical(self, df: pd.DataFrame, query: str) -> AnalysisResult:
        """Analyze numerical data"""
        results = {
            "type": "numerical",
            "statistics": {},
            "correlations": {}
        }
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            # Basic statistics
            results["statistics"][col] = {
                "mean": df[col].mean(),
                "median": df[col].median(),
                "std": df[col].std(),
                "skew": df[col].skew()
            }
        
        # Correlation analysis
        if len(numeric_cols) > 1:
            results["correlations"] = df[numeric_cols].corr().to_dict()
        
        return results
    
    async def _analyze_categorical(self, df: pd.DataFrame, query: str) -> AnalysisResult:
        """Analyze categorical data"""
        results = {
            "type": "categorical",
            "frequencies": {}
        }
        
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        for col in categorical_cols:
            # Frequency analysis
            results["frequencies"][col] = df[col].value_counts().to_dict()
        
        return results
    
    def _test_normality(self, series: pd.Series) -> bool:
        """Test if a series follows normal distribution"""
        _, p_value = stats.normaltest(series.dropna())
        return p_value > 0.05
    
    def _detect_outliers(self, series: pd.Series) -> Dict[str, Any]:
        """Detect outliers using IQR method"""
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers = series[(series < lower_bound) | (series > upper_bound)]
        
        return {
            "count": len(outliers),
            "percentage": (len(outliers) / len(series)) * 100,
            "bounds": {"lower": lower_bound, "upper": upper_bound}
        } 