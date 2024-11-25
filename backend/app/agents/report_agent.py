from .analysis_agent import AnalysisAgent
from llama_index.core import VectorStoreIndex, Document, ServiceContext
from llama_index.llms.cohere import Cohere
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from llama_index.core.query_engine import PandasQueryEngine
from llama_index.core.tools import FunctionTool
from typing import Dict, Any, List, Optional
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import os
from dotenv import load_dotenv
import numpy as np
from datetime import datetime
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class ReportAgent:
    def __init__(self):
        self.llm = Cohere(
            api_key=os.getenv("COHERE_API_KEY"),
            model="command-nightly"
        )
        self.service_context = ServiceContext.from_defaults(llm=self.llm)
        self.analysis_agent = AnalysisAgent(self.llm)
        self.tools = []
        self.agent = None
        self.data_frame = None
        
    def _detect_data_type(self) -> str:
        """Detect the type of data in the DataFrame"""
        if self.data_frame is None:
            return "unknown"
            
        date_cols = self.data_frame.select_dtypes(include=['datetime64']).columns
        numeric_cols = self.data_frame.select_dtypes(include=['float64', 'int64']).columns
        
        if len(date_cols) > 0 and len(numeric_cols) > 0:
            return "time_series"
        elif len(numeric_cols) > 0:
            return "numerical"
        else:
            return "categorical"

    def _create_advanced_visualization(self, data_type: str, columns: List[str], title: str = "") -> dict:
        """Create advanced visualizations based on data type"""
        try:
            if data_type == "time_series":
                date_col = self.data_frame.select_dtypes(include=['datetime64']).columns[0]
                numeric_col = self.data_frame.select_dtypes(include=['float64', 'int64']).columns[0]
                
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=self.data_frame[date_col],
                    y=self.data_frame[numeric_col],
                    mode='lines+markers',
                    name=numeric_col
                ))
                fig.add_trace(go.Scatter(
                    x=self.data_frame[date_col],
                    y=self.data_frame[numeric_col].rolling(window=7).mean(),
                    mode='lines',
                    name='7-day Moving Average'
                ))
                
            elif data_type == "numerical":
                fig = px.histogram(
                    self.data_frame,
                    x=columns[0],
                    marginal="box",
                    title=title
                )
                
            elif data_type == "categorical":
                fig = px.bar(
                    self.data_frame[columns[0]].value_counts().reset_index(),
                    x='index',
                    y=columns[0],
                    title=title
                )
            
            fig.update_layout(
                template="plotly_dark",
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)'
            )
            
            return json.loads(fig.to_json())
            
        except Exception as e:
            logger.error(f"Advanced visualization creation failed: {str(e)}")
            raise Exception(f"Visualization creation failed: {str(e)}")

    def _generate_statistical_insights(self) -> Dict[str, Any]:
        """Generate statistical insights from the data"""
        try:
            insights = {
                "summary_stats": self.data_frame.describe().to_dict(),
                "correlations": {},
                "missing_values": self.data_frame.isnull().sum().to_dict(),
                "unique_values": {},
                "outliers": {}
            }
            
            # Calculate correlations for numeric columns
            numeric_cols = self.data_frame.select_dtypes(include=['float64', 'int64']).columns
            if len(numeric_cols) > 1:
                insights["correlations"] = self.data_frame[numeric_cols].corr().to_dict()
            
            # Detect outliers using IQR method
            for col in numeric_cols:
                Q1 = self.data_frame[col].quantile(0.25)
                Q3 = self.data_frame[col].quantile(0.75)
                IQR = Q3 - Q1
                outliers = self.data_frame[(self.data_frame[col] < (Q1 - 1.5 * IQR)) | 
                                         (self.data_frame[col] > (Q3 + 1.5 * IQR))][col]
                insights["outliers"][col] = len(outliers)
            
            return insights
            
        except Exception as e:
            logger.error(f"Statistical insight generation failed: {str(e)}")
            raise Exception(f"Statistical analysis failed: {str(e)}")

    def setup_tools(self, data: Dict[str, Any]):
        """Setup tools for the agent including data analysis and visualization capabilities"""
        try:
            # Convert data to pandas DataFrame
            if isinstance(data["data"], list):
                self.data_frame = pd.DataFrame(data["data"])
            else:
                self.data_frame = pd.DataFrame([data["data"]])

            # Create pandas query engine
            pandas_query_engine = PandasQueryEngine(
                df=self.data_frame,
                service_context=self.service_context
            )

            # Tools for data analysis
            tools = [
                QueryEngineTool(
                    query_engine=pandas_query_engine,
                    metadata=ToolMetadata(
                        name="data_analyzer",
                        description="Analyzes data and provides statistical insights"
                    )
                ),
                FunctionTool(
                    fn=self._create_advanced_visualization,
                    name="create_visualization",
                    description="Creates interactive visualizations based on data type"
                )
            ]

            # Create agent with tools
            self.agent = ReActAgent.from_tools(
                tools,
                llm=self.llm,
                verbose=True
            )

        except Exception as e:
            logger.error(f"Tool setup failed: {str(e)}")
            raise Exception(f"Tool setup failed: {str(e)}")

    async def generate_report(self, query: str) -> Dict[str, Any]:
        """Generate comprehensive report with analysis and visualizations"""
        if not self.agent:
            raise ValueError("Agent not initialized. Call setup_tools first.")

        try:
            # Get data type and analysis from AnalysisAgent
            analysis_results = await self.analysis_agent.analyze_data(self.data_frame, query)
            
            # Generate LLM-based analysis
            llm_response = await self.agent.aquery(query)
            
            # Create visualizations based on data type
            data_type = self._detect_data_type()
            columns = list(self.data_frame.columns)
            
            visualizations = self._create_advanced_visualization(
                data_type=data_type,
                columns=columns[:2],
                title=f"Analysis of {columns[0]}"
            )

            # Generate statistical insights
            insights = self._generate_statistical_insights()

            # Combine all results
            return {
                "status": "success",
                "analysis": {
                    "llm_analysis": str(llm_response),
                    "statistical_analysis": analysis_results,
                    "insights": insights
                },
                "data_type": data_type,
                "visualizations": visualizations,
                "metadata": {
                    "data_shape": self.data_frame.shape,
                    "columns": columns,
                    "data_types": self.data_frame.dtypes.to_dict(),
                    "timestamp": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise Exception(f"Report generation failed: {str(e)}") 