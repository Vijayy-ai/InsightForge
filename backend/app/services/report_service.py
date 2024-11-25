from typing import Dict, Any
import pandas as pd
import numpy as np
from ..utils.data_processor import DataProcessor
from ..core.cohere_client import get_cohere_client
import logging
from ..utils.visualization import VisualizationGenerator
import uuid
from datetime import datetime
from ..core.exceptions import ReportGenerationError
import json
from jinja2 import Template
import pdfkit
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        self.cohere = get_cohere_client()
        self.data_processor = DataProcessor()
        self.viz_generator = VisualizationGenerator()
        # Configure PDF paths
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(exist_ok=True)

    async def generate_report(self, data: Dict[str, Any], query: str, format: str = "json") -> Dict[str, Any]:
        """Generate analysis report"""
        try:
            # Process data - handle both list and dict inputs
            if isinstance(data, dict) and "data" in data:
                processed_data = data["data"]
            else:
                processed_data = data

            # Convert to DataFrame for processing
            if isinstance(processed_data, list):
                df = pd.DataFrame(processed_data)
            else:
                df = pd.DataFrame([processed_data])
            
            # Generate analysis using Cohere
            llm_analysis = await self._generate_analysis(df, query)
            
            # Generate statistical insights
            insights = self._generate_insights(df)
            
            # Generate visualizations
            data_type = self._detect_data_type(df)
            visualizations = await self.viz_generator.generate_visualizations(df, data_type)
            
            # Create report with the correct structure
            report = {
                "id": str(uuid.uuid4()),
                "data_type": data_type,
                "analysis": {
                    "llm_analysis": llm_analysis if llm_analysis else "No analysis generated",
                    "insights": insights,
                    "statistical_analysis": {
                        "time_series": None,
                        "numerical": None,
                        "categorical": None
                    },
                    "data_quality": self._assess_data_quality(df)
                },
                "visualizations": visualizations,
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "source": {
                        "type": "upload",
                        "name": "data_analysis"
                    },
                    "rows": len(df),
                    "columns": len(df.columns)
                }
            }
            
            if format == "pdf":
                try:
                    # Generate PDF using the report data
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    pdf_path = await self._generate_pdf_report(report, timestamp)
                    
                    return {
                        "file_path": str(pdf_path),
                        "timestamp": timestamp
                    }
                except Exception as pdf_error:
                    logger.error(f"PDF generation failed: {str(pdf_error)}")
                    raise ReportGenerationError(f"PDF generation failed: {str(pdf_error)}")
            
            return report
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise ReportGenerationError(f"Failed to generate report: {str(e)}")

    async def _generate_analysis(self, df: pd.DataFrame, query: str) -> str:
        """Generate analysis using Cohere"""
        try:
            # Prepare data summary
            data_summary = df.describe().to_string()
            
            # Generate prompt
            prompt = f"Analyze this data:\n{data_summary}\n\nQuery: {query}"
            
            # Get response from Cohere
            response = await self.cohere.generate(
                prompt=prompt,
                max_tokens=500,
                temperature=0.7,
                stop_sequences=[],
                return_likelihoods='NONE'
            )
            
            return response.generations[0].text if response.generations else "No analysis generated"
            
        except Exception as e:
            logger.error(f"Analysis generation failed: {str(e)}")
            return "Analysis generation failed. Please try again later."

    def _generate_insights(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate statistical insights"""
        try:
            insights = {
                "summary_stats": {}
            }
            
            # Generate summary statistics for numerical columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for column in numeric_cols:
                insights["summary_stats"][column] = {
                    "mean": float(df[column].mean()),
                    "median": float(df[column].median()),
                    "std": float(df[column].std()),
                    "min": float(df[column].min()),
                    "max": float(df[column].max())
                }
            
            return insights
            
        except Exception as e:
            logger.error(f"Insight generation failed: {str(e)}")
            return {"summary_stats": {}}

    def _assess_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess data quality"""
        try:
            total_records = len(df)
            missing_values = df.isnull().sum().to_dict()
            
            return {
                "completeness": {
                    "score": 1.0 - (sum(missing_values.values()) / (total_records * len(df.columns))),
                    "missing_values": missing_values,
                    "total_records": total_records
                },
                "accuracy": {
                    "score": 1.0,
                    "invalid_values": {}
                },
                "consistency": {
                    "score": 1.0,
                    "inconsistencies": {}
                }
            }
        except Exception as e:
            logger.error(f"Data quality assessment failed: {str(e)}")
            return {
                "completeness": {"score": 0, "missing_values": {}, "total_records": 0},
                "accuracy": {"score": 0, "invalid_values": {}},
                "consistency": {"score": 0, "inconsistencies": {}}
            }

    def _detect_data_type(self, df: pd.DataFrame) -> str:
        """Detect the type of data in the DataFrame"""
        if df.empty:
            return "mixed"
            
        # Check for datetime columns
        date_cols = df.select_dtypes(include=['datetime64']).columns
        if len(date_cols) > 0:
            return "time_series"
            
        # Count column types
        numeric_cols = len(df.select_dtypes(include=['number']).columns)
        categorical_cols = len(df.select_dtypes(include=['object', 'category']).columns)
        
        if numeric_cols == len(df.columns):
            return "numerical"
        elif categorical_cols == len(df.columns):
            return "categorical"
        else:
            return "mixed"

    async def _generate_pdf_report(self, report: Dict[str, Any], timestamp: str) -> Path:
        """Generate PDF report"""
        try:
            # Create HTML template
            template = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Analysis Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .section { margin-bottom: 30px; }
                    .visualization { max-width: 100%; height: auto; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #ddd; }
                    th { background-color: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>Analysis Report</h1>
                
                <div class="section">
                    <h2>Analysis</h2>
                    <p>{{ report.analysis.llm_analysis }}</p>
                </div>
                
                <div class="section">
                    <h2>Statistical Insights</h2>
                    <table>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                        {% for metric, value in report.analysis.insights.summary_stats.items() %}
                        <tr>
                            <td>{{ metric }}</td>
                            <td>{{ value }}</td>
                        </tr>
                        {% endfor %}
                    </table>
                </div>
                
                <div class="section">
                    <h2>Data Quality</h2>
                    <table>
                        <tr>
                            <th>Metric</th>
                            <th>Score</th>
                        </tr>
                        <tr>
                            <td>Completeness</td>
                            <td>{{ "%.2f"|format(report.analysis.data_quality.completeness.score * 100) }}%</td>
                        </tr>
                        <tr>
                            <td>Accuracy</td>
                            <td>{{ "%.2f"|format(report.analysis.data_quality.accuracy.score * 100) }}%</td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
            """
            
            # Render template with report data
            html_content = Template(template).render(report=report)
            
            # Save HTML to temporary file
            html_path = self.temp_dir / f"report_{timestamp}.html"
            html_path.write_text(html_content)
            
            # Convert HTML to PDF
            pdf_path = self.temp_dir / f"report_{timestamp}.pdf"
            pdfkit.from_file(str(html_path), str(pdf_path))
            
            # Clean up HTML file
            html_path.unlink()
            
            return pdf_path
            
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise ReportGenerationError(f"Failed to generate PDF: {str(e)}")