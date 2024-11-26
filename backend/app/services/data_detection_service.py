import logging
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from ..core.exceptions import DataValidationError

logger = logging.getLogger(__name__)

class DataTypeDetectionService:
    @staticmethod
    def detect_data_type(df: pd.DataFrame) -> str:
        """Detect the type of data in the DataFrame"""
        try:
            # Check if DataFrame is empty
            if df.empty:
                raise DataValidationError("DataFrame is empty")

            # Get column types
            date_cols = df.select_dtypes(include=['datetime64']).columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns

            # Determine data type
            if len(date_cols) > 0 and len(numeric_cols) > 0:
                return "time_series"
            elif len(numeric_cols) == len(df.columns):
                return "numerical"
            elif len(categorical_cols) == len(df.columns):
                return "categorical"
            else:
                return "mixed"

        except Exception as e:
            raise DataValidationError(f"Error detecting data type: {str(e)}")

    @staticmethod
    def validate_time_series(df: pd.DataFrame) -> bool:
        """Validate if data is suitable for time series analysis"""
        try:
            date_cols = df.select_dtypes(include=['datetime64']).columns
            if len(date_cols) == 0:
                return False

            # Check for regular intervals
            date_col = date_cols[0]
            intervals = pd.Series(df[date_col]).diff().value_counts()
            return len(intervals) <= 2  # Allow for one type of interval plus NaT

        except Exception:
            return False

    @staticmethod
    def get_column_types(df: pd.DataFrame) -> Dict[str, List[str]]:
        """Get column types categorized"""
        return {
            "date_columns": list(df.select_dtypes(include=['datetime64']).columns),
            "numeric_columns": list(df.select_dtypes(include=[np.number]).columns),
            "categorical_columns": list(df.select_dtypes(include=['object', 'category']).columns)
        } 

    @staticmethod
    def detect_data_type_with_confidence(df: pd.DataFrame) -> Dict[str, Any]:
        """Detect data type with confidence score"""
        try:
            date_cols = df.select_dtypes(include=['datetime64']).columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns
            
            total_cols = len(df.columns)
            confidence = 0
            data_type = ""
            
            if len(date_cols) > 0 and len(numeric_cols) > 0:
                time_series_confidence = (len(date_cols) + len(numeric_cols)) / (total_cols * 2) * 100
                confidence = time_series_confidence
                data_type = "time_series"
            elif len(numeric_cols) == total_cols:
                confidence = 100
                data_type = "numerical"
            elif len(categorical_cols) == total_cols:
                confidence = 100
                data_type = "categorical"
            else:
                # Mixed type - calculate confidence based on dominant type
                type_counts = {
                    'numeric': len(numeric_cols),
                    'categorical': len(categorical_cols),
                    'datetime': len(date_cols)
                }
                dominant_type = max(type_counts.items(), key=lambda x: x[1])
                confidence = (dominant_type[1] / total_cols) * 100
                data_type = "mixed"
            
            return {
                "type": data_type,
                "confidence": round(confidence, 2),
                "column_types": {
                    "date_columns": list(date_cols),
                    "numeric_columns": list(numeric_cols),
                    "categorical_columns": list(categorical_cols)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in data type detection: {str(e)}")
            raise DataValidationError(f"Failed to detect data type: {str(e)}")