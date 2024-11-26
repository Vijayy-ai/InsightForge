import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from typing import Dict, Any, List
import logging
import json

logger = logging.getLogger(__name__)

class VisualizationService:
    async def create_visualization(
        self,
        df: pd.DataFrame,
        data_type: str,
        columns: List[str]
    ) -> List[Dict[str, Any]]:
        """Create visualizations based on data type"""
        try:
            visualizations = []
            
            if data_type == "time_series":
                viz = await self._create_time_series_plot(df, columns)
                if viz:
                    visualizations.append(viz)
            elif data_type == "numerical":
                viz = await self._create_numerical_plot(df, columns)
                if viz:
                    visualizations.append(viz)
            elif data_type == "categorical":
                viz = await self._create_categorical_plot(df, columns)
                if viz:
                    visualizations.append(viz)
            else:
                viz = await self._create_mixed_plot(df, columns)
                if viz:
                    visualizations.append(viz)
            
            # Always return an array, even if empty
            return visualizations or []
            
        except Exception as e:
            logger.error(f"Visualization creation failed: {str(e)}")
            return []

    async def _create_time_series_plot(
        self,
        df: pd.DataFrame,
        columns: List[str]
    ) -> Dict[str, Any]:
        """Create time series visualization"""
        try:
            fig = go.Figure()
            
            for col in columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df[col],
                        name=col,
                        mode='lines+markers'
                    ))
            
            fig.update_layout(
                title="Time Series Analysis",
                xaxis_title="Time",
                yaxis_title="Value",
                template="plotly_dark"
            )
            
            return json.loads(fig.to_json())
            
        except Exception as e:
            logger.error(f"Time series plot creation failed: {str(e)}")
            return {}

    async def _create_numerical_plot(
        self,
        df: pd.DataFrame,
        columns: List[str]
    ) -> Dict[str, Any]:
        """Create numerical visualization"""
        try:
            fig = go.Figure()
            
            for col in columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    fig.add_trace(go.Box(
                        y=df[col],
                        name=col,
                        boxpoints='outliers'
                    ))
            
            fig.update_layout(
                title="Numerical Distribution",
                yaxis_title="Value",
                template="plotly_dark"
            )
            
            return json.loads(fig.to_json())
            
        except Exception as e:
            logger.error(f"Numerical plot creation failed: {str(e)}")
            return {}

    async def _create_categorical_plot(
        self,
        df: pd.DataFrame,
        columns: List[str]
    ) -> Dict[str, Any]:
        """Create categorical visualization"""
        try:
            fig = go.Figure()
            
            for col in columns:
                value_counts = df[col].value_counts()
                fig.add_trace(go.Bar(
                    x=value_counts.index,
                    y=value_counts.values,
                    name=col
                ))
            
            fig.update_layout(
                title="Categorical Distribution",
                xaxis_title="Categories",
                yaxis_title="Count",
                template="plotly_dark"
            )
            
            return json.loads(fig.to_json())
            
        except Exception as e:
            logger.error(f"Categorical plot creation failed: {str(e)}")
            return {}

    async def _create_mixed_plot(
        self,
        df: pd.DataFrame,
        columns: List[str]
    ) -> Dict[str, Any]:
        """Create mixed data visualization"""
        try:
            fig = go.Figure()
            
            for col in columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    fig.add_trace(go.Box(
                        y=df[col].dropna(),
                        name=col,
                        boxpoints='outliers'
                    ))
                else:
                    value_counts = df[col].value_counts()
                    fig.add_trace(go.Bar(
                        x=value_counts.index,
                        y=value_counts.values,
                        name=col
                    ))
            
            fig.update_layout(
                title="Data Distribution",
                template="plotly_dark",
                showlegend=True,
                height=500
            )
            
            return {
                "type": "mixed",
                "data": fig.data,
                "layout": fig.layout
            }
            
        except Exception as e:
            logger.error(f"Mixed plot creation failed: {str(e)}")
            return None 