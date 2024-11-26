from typing import List
import pandas as pd

class DataTypeDetector:
    @staticmethod
    def detect_data_type(df: pd.DataFrame) -> str:
        """Centralized data type detection"""
        date_cols = df.select_dtypes(include=['datetime64']).columns
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        
        if len(date_cols) > 0 and len(numeric_cols) > 0:
            return "time_series"
        elif len(numeric_cols) > 0:
            return "numerical"
        else:
            return "categorical" 