import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import json
import logging
from ..core.exceptions import DataProcessingError

logger = logging.getLogger(__name__)

class VisualizationGenerator:
    def __init__(self):
        self.viz_templates = {
            'time_series': self._time_series_viz,
            'numerical': self._numerical_viz,
            'categorical': self._categorical_viz,
            'mixed': self._mixed_viz
        }

    async def generate_visualizations(
        self,
        df: pd.DataFrame,
        data_type: str
    ) -> Dict[str, Any]:
        """Generate appropriate visualizations based on data type"""
        try:
            viz_func = self.viz_templates.get(data_type, self._mixed_viz)
            figures = await viz_func(df)
            
            if not figures:
                return {
                    "interactive": "{}",
                    "static": [],
                    "default_type": "none"
                }

            # Convert figures to JSON-safe format with proper structure
            interactive_data = []
            for fig in figures:
                fig_dict = fig.to_dict()
                # Convert numpy values to native Python types
                data = self._convert_numpy_values(fig_dict["data"])
                layout = self._convert_numpy_values(fig_dict["layout"])
                interactive_data.append({"data": data, "layout": layout})

            return {
                "interactive": json.dumps(interactive_data),
                "static": [],
                "default_type": data_type
            }
            
        except Exception as e:
            logger.error(f"Visualization generation failed: {str(e)}")
            return {
                "interactive": "{}",
                "static": [],
                "default_type": "none"
            }

    def _convert_numpy_values(self, obj: Any) -> Any:
        """Convert numpy values to Python native types"""
        if isinstance(obj, dict):
            return {k: self._convert_numpy_values(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_values(v) for v in obj]
        elif isinstance(obj, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, np.int64)):
            return int(obj)
        elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return obj

    async def _time_series_viz(self, df: pd.DataFrame) -> List[go.Figure]:
        """Generate time series visualizations"""
        figures = []
        
        try:
            # Line chart for trends
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                fig = px.line(df, x=df.index, y=numeric_cols)
                fig.update_layout(
                    title="Time Series Trend Analysis",
                    xaxis_title="Time",
                    yaxis_title="Value",
                    template="plotly_white"
                )
                figures.append(fig)
        except Exception as e:
            print(f"Error in time series visualization: {e}")
        
        return figures

    async def _numerical_viz(self, df: pd.DataFrame) -> List[go.Figure]:
        """Generate numerical visualizations"""
        figures = []
        
        try:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            # Distribution plot
            if len(numeric_cols) > 0:
                fig = go.Figure()
                for col in numeric_cols:
                    fig.add_trace(go.Histogram(x=df[col], name=col, opacity=0.7))
                fig.update_layout(
                    title="Numerical Distributions",
                    barmode='overlay',
                    template="plotly_white"
                )
                figures.append(fig)
            
            # Correlation heatmap
            if len(numeric_cols) > 1:
                corr = df[numeric_cols].corr()
                fig = px.imshow(
                    corr,
                    title="Correlation Heatmap",
                    template="plotly_white"
                )
                figures.append(fig)
        except Exception as e:
            print(f"Error in numerical visualization: {e}")
            
        return figures

    async def _categorical_viz(self, df: pd.DataFrame) -> List[go.Figure]:
        """Generate categorical visualizations"""
        figures = []
        
        try:
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            
            for col in cat_cols:
                # Bar chart for category counts
                fig = px.bar(
                    df[col].value_counts().reset_index(),
                    x='index',
                    y=col,
                    title=f"Distribution of {col}"
                )
                fig.update_layout(template="plotly_white")
                figures.append(fig)
        except Exception as e:
            print(f"Error in categorical visualization: {e}")
        
        return figures

    async def _mixed_viz(self, df: pd.DataFrame) -> List[go.Figure]:
        """Generate mixed data type visualizations"""
        figures = []
        
        try:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            
            # Box plots for numerical by categorical
            if len(numeric_cols) > 0 and len(cat_cols) > 0:
                for num_col in numeric_cols:
                    for cat_col in cat_cols:
                        fig = px.box(df, x=cat_col, y=num_col)
                        fig.update_layout(
                            title=f"{num_col} by {cat_col}",
                            template="plotly_white"
                        )
                        figures.append(fig)
        except Exception as e:
            print(f"Error in mixed visualization: {e}")
        
        return figures

    def _convert_to_plotly_json(self, figures: List[go.Figure]) -> str:
        """Convert Plotly figures to JSON format"""
        try:
            if not figures:
                return "{}"
                
            result = {
                'data': [fig.to_dict()['data'] for fig in figures],
                'layout': [fig.to_dict()['layout'] for fig in figures]
            }
            return json.dumps(result)
            
        except Exception as e:
            print(f"JSON conversion error: {str(e)}")  # Debug logging
            return "{}"

def generate_visualization_data(df: pd.DataFrame, column: str) -> Dict[str, Any]:
    """Generate visualization data for a given column"""
    if df[column].dtype in [np.number]:
        return {
            "type": "histogram",
            "data": df[column].tolist(),
            "labels": df.index.tolist()
        }
    elif pd.api.types.is_datetime64_any_dtype(df[column]):
        return {
            "type": "line",
            "x": df[column].tolist(),
            "y": df.index.tolist()
        }
    else:
        return {
            "type": "bar",
            "data": df[column].value_counts().tolist(),
            "labels": df[column].value_counts().index.tolist()
        } 