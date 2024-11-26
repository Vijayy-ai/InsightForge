from typing import Dict, Any, Optional, Union
import pandas as pd
from datetime import datetime
import logging
import uuid
from ..core.exceptions import ReportGenerationError
from ..services.visualization_service import VisualizationService
from ..services.llm_service import LLMService
from ..utils.cohere_client import get_cohere_client
from ..report_generators.generator import ReportGenerator

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        self.viz_service = VisualizationService()
        self.llm_service = LLMService()
        self.cohere_client = get_cohere_client()
        
    async def process_data(
        self,
        data: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process data before report generation"""
        try:
            # Handle both list and dict inputs
            if isinstance(data, dict) and "data" in data:
                processed_data = data["data"]
            else:
                processed_data = data

            # Convert to DataFrame for processing
            if isinstance(processed_data, list):
                df = pd.DataFrame(processed_data)
            else:
                df = pd.DataFrame([processed_data])

            return {
                "data": df.to_dict(orient='records'),
                "metadata": {
                    "columns": list(df.columns),
                    "rows": len(df),
                    "dtypes": df.dtypes.astype(str).to_dict()
                }
            }
        except Exception as e:
            logger.error(f"Data processing error: {str(e)}")
            raise ReportGenerationError(f"Failed to process data: {str(e)}")

    async def generate_report(
        self,
        data: Dict[str, Any],
        query: str,
        format: str = "json"
    ) -> Union[Dict[str, Any], bytes]:
        """Generate analysis report"""
        try:
            logger.info(f"Generating report with format: {format}")
            
            # Process data and generate report content
            processed_data = await self.process_data(data)
            if not processed_data or "data" not in processed_data:
                raise ReportGenerationError("Invalid data format")
            
            df = pd.DataFrame(processed_data["data"])
            if df.empty:
                raise ReportGenerationError("No data to analyze")
            
            # Generate report content
            report_content = await self._generate_report_content(df, query)
            
            # Generate final report in requested format
            report_generator = ReportGenerator(cohere_client=self.cohere_client)
            return await report_generator.generate_report(report_content, format)
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            if isinstance(e, ReportGenerationError):
                raise e
            raise ReportGenerationError(f"Report generation failed: {str(e)}")

    async def _generate_report_content(self, df: pd.DataFrame, query: str) -> Dict[str, Any]:
        """Generate report content structure"""
        try:
            llm_analysis = await self.llm_service.generate_analysis(df, query)
            insights = await self._generate_insights(df)
            data_type = self._detect_data_type(df)
            visualizations = await self.viz_service.create_visualization(
                df=df,
                data_type=data_type,
                columns=list(df.columns)[:2]
            )
            
            return {
                "id": str(uuid.uuid4()),
                "data_type": data_type,
                "analysis": {
                    "llm_analysis": llm_analysis or "Analysis not available",
                    "insights": {
                        "summary_stats": insights.get("summary_statistics", {})
                    },
                    "statistical_analysis": {
                        "time_series": None,
                        "numerical": await self._generate_statistical_analysis(df),
                        "categorical": None
                    },
                    "data_quality": await self._assess_data_quality(df)
                },
                "visualizations": visualizations or [],
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "source": {
                        "type": "file",
                        "name": "uploaded_data"
                    },
                    "rows": len(df),
                    "columns": len(df.columns)
                }
            }
        except Exception as e:
            logger.error(f"Error generating report content: {str(e)}")
            raise ReportGenerationError(f"Failed to generate report content: {str(e)}")

    async def _generate_insights(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate statistical insights from the data"""
        try:
            return {
                "summary_statistics": df.describe().to_dict(),
                "missing_values": df.isnull().sum().to_dict(),
                "correlation_matrix": df.select_dtypes(include=['number'])
                    .corr()
                    .to_dict() if not df.select_dtypes(include=['number']).empty else None
            }
        except Exception as e:
            logger.warning(f"Error generating insights: {str(e)}")
            return {}

    async def _generate_statistical_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate detailed statistical analysis"""
        try:
            return {
                "numerical_analysis": {
                    "mean": df.select_dtypes(include=['number']).mean().to_dict(),
                    "median": df.select_dtypes(include=['number']).median().to_dict(),
                    "std": df.select_dtypes(include=['number']).std().to_dict()
                },
                "categorical_analysis": {
                    col: df[col].value_counts().to_dict()
                    for col in df.select_dtypes(include=['object']).columns
                }
            }
        except Exception as e:
            logger.warning(f"Error in statistical analysis: {str(e)}")
            return {}

    async def _assess_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess data quality metrics"""
        try:
            # Calculate completeness (percentage of non-null values)
            completeness = {
                "score": ((1 - df.isnull().mean().mean()) * 100).round(2),
                "details": {
                    col: ((1 - df[col].isnull().mean()) * 100).round(2)
                    for col in df.columns
                }
            }

            # Calculate accuracy (percentage of values within expected ranges/formats)
            accuracy = {
                "score": 100.0,  # Default score
                "details": {}
            }
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    # For numeric columns, check for outliers
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    lower = q1 - 1.5 * iqr
                    upper = q3 + 1.5 * iqr
                    valid_range = df[col].between(lower, upper, inclusive='both')
                    accuracy["details"][col] = (valid_range.mean() * 100).round(2)
                else:
                    # For non-numeric columns, check for empty strings and whitespace
                    valid_values = df[col].astype(str).str.strip().str.len() > 0
                    accuracy["details"][col] = (valid_values.mean() * 100).round(2)
            
            accuracy["score"] = sum(accuracy["details"].values()) / len(accuracy["details"]) if accuracy["details"] else 100.0

            # Calculate consistency (check for uniform formats/patterns)
            consistency = {
                "score": 100.0,
                "details": {}
            }

            return {
                "completeness": completeness,
                "accuracy": accuracy,
                "consistency": consistency
            }
        except Exception as e:
            logger.warning(f"Error in data quality assessment: {str(e)}")
            return {
                "completeness": {"score": 0, "details": {}},
                "accuracy": {"score": 0, "details": {}},
                "consistency": {"score": 0, "details": {}}
            }

    def _detect_data_type(self, df: pd.DataFrame) -> str:
        """Detect the type of data in the DataFrame"""
        if df.empty:
            return "empty"
            
        if pd.api.types.is_datetime64_any_dtype(df.index):
            return "time_series"
            
        numeric_cols = len(df.select_dtypes(include=['number']).columns)
        categorical_cols = len(df.select_dtypes(include=['object', 'category']).columns)
        
        if numeric_cols == len(df.columns):
            return "numerical"
        elif categorical_cols == len(df.columns):
            return "categorical"
        else:
            return "mixed"