import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
from datetime import datetime

class DataProcessor:
    @staticmethod
    def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Process and clean the input data"""
        try:
            if isinstance(data, dict) and "data" in data:
                df = pd.DataFrame(data["data"])
            else:
                df = pd.DataFrame(data)
            
            # Basic cleaning
            df = df.replace([np.inf, -np.inf], np.nan)
            
            # Determine data type
            data_type = DataProcessor._determine_data_type(df)
            
            # Generate metadata
            metadata = {
                "date_columns": list(df.select_dtypes(include=['datetime64']).columns),
                "numeric_columns": list(df.select_dtypes(include=[np.number]).columns),
                "categorical_columns": list(df.select_dtypes(include=['object', 'category']).columns),
                "statistics": {
                    "row_count": len(df),
                    "column_count": len(df.columns),
                    "missing_values": df.isnull().sum().to_dict()
                }
            }
            
            return {
                "type": "structured",
                "data": df.to_dict('records'),
                "data_type": data_type,
                "metadata": metadata
            }
            
        except Exception as e:
            raise ValueError(f"Failed to process data: {str(e)}")

    @staticmethod
    def _determine_data_type(df: pd.DataFrame) -> str:
        """Determine the type of data"""
        if df.empty:
            return "empty"
            
        # Check for datetime index
        if pd.api.types.is_datetime64_any_dtype(df.index):
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