import plotly.express as px
import plotly.graph_objects as go
import json
import pandas as pd
from typing import Dict, Any, List, Optional
import logging
import numpy as np

logger = logging.getLogger(__name__)

class VisualizationError(Exception):
    """Custom exception for visualization errors"""
    pass

class VisualizationService:
    def create_visualization(
        self, 
        df: pd.DataFrame, 
        data_type: str, 
        columns: List[str], 
        title: str = ""
    ) -> Dict[str, Any]:
        """Create visualizations based on data type"""
        try:
            # Validate input data
            if df.empty:
                raise VisualizationError("Cannot create visualization: DataFrame is empty")
            
            if not columns:
                raise VisualizationError("Cannot create visualization: No columns provided")

            # Create visualization based on data type
            if data_type == "time_series":
                if not self._validate_time_series_data(df, columns):
                    raise VisualizationError("Invalid time series data")
                return self._create_time_series_viz(df, columns, title)
            elif data_type == "numerical":
                if not self._validate_numerical_data(df, columns):
                    raise VisualizationError("Invalid numerical data")
                return self._create_numerical_viz(df, columns, title)
            elif data_type == "categorical":
                if not self._validate_categorical_data(df, columns):
                    raise VisualizationError("Invalid categorical data")
                return self._create_categorical_viz(df, columns, title)
            else:
                return self._create_mixed_viz(df, columns, title)
                
        except Exception as e:
            logger.error(f"Visualization creation failed: {str(e)}")
            raise VisualizationError(f"Failed to create visualization: {str(e)}")

    def _validate_time_series_data(self, df: pd.DataFrame, columns: List[str]) -> bool:
        """Validate time series data"""
        try:
            date_cols = df.select_dtypes(include=['datetime64']).columns
            return len(date_cols) > 0 and any(col in df.columns for col in columns)
        except Exception:
            return False

    def _validate_numerical_data(self, df: pd.DataFrame, columns: List[str]) -> bool:
        """Validate numerical data"""
        try:
            return all(pd.api.types.is_numeric_dtype(df[col]) for col in columns)
        except Exception:
            return False

    def _validate_categorical_data(self, df: pd.DataFrame, columns: List[str]) -> bool:
        """Validate categorical data"""
        try:
            return all(pd.api.types.is_categorical_dtype(df[col]) or 
                      pd.api.types.is_object_dtype(df[col]) for col in columns)
        except Exception:
            return False

    def _create_time_series_viz(self, df: pd.DataFrame, columns: List[str], title: str) -> dict:
        date_col = df.select_dtypes(include=['datetime64']).columns[0]
        numeric_col = df.select_dtypes(include=['float64', 'int64']).columns[0]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df[date_col],
            y=df[numeric_col],
            mode='lines+markers',
            name=numeric_col
        ))
        fig.add_trace(go.Scatter(
            x=df[date_col],
            y=df[numeric_col].rolling(window=7).mean(),
            mode='lines',
            name='7-day Moving Average'
        ))
        
        self._update_layout(fig, title)
        return json.loads(fig.to_json())

    def _create_numerical_viz(self, df: pd.DataFrame, columns: List[str], title: str) -> dict:
        fig = px.histogram(
            df,
            x=columns[0],
            marginal="box",
            title=title
        )
        self._update_layout(fig, title)
        return json.loads(fig.to_json())

    def _create_categorical_viz(self, df: pd.DataFrame, columns: List[str], title: str) -> dict:
        fig = px.bar(
            df[columns[0]].value_counts().reset_index(),
            x='index',
            y=columns[0],
            title=title
        )
        self._update_layout(fig, title)
        return json.loads(fig.to_json())

    def _create_mixed_viz(self, df: pd.DataFrame, columns: List[str], title: str) -> dict:
        fig = go.Figure()
        for col in df.select_dtypes(include=[np.number]).columns[:3]:
            fig.add_trace(go.Box(y=df[col], name=col))
        self._update_layout(fig, title)
        return json.loads(fig.to_json())

    def _update_layout(self, fig: go.Figure, title: str):
        """Apply consistent layout styling"""
        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            title=title
        ) 