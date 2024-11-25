from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from ..core.exceptions import DataValidationError
import json
class ValidationService:
    @staticmethod
    def validate_data_structure(data: Dict[str, Any]) -> None:
        """Validate the structure of incoming data"""
        try:
            if not isinstance(data, dict):
                raise DataValidationError("Data must be a dictionary")
                
            required_fields = ['type', 'data']
            for field in required_fields:
                if field not in data:
                    raise DataValidationError(f"Missing required field: {field}")
                    
            if data['type'] not in ['structured', 'unstructured']:
                raise DataValidationError("Invalid data type")
                
            if not data['data']:
                raise DataValidationError("Data cannot be empty")
                
        except Exception as e:
            raise DataValidationError(f"Data validation failed: {str(e)}")
            
    @staticmethod
    def validate_query(query: str, db_type: str) -> None:
        """Validate database query based on database type"""
        try:
            if not query.strip():
                raise DataValidationError("Query cannot be empty")
                
            if db_type == 'mongodb':
                # Validate MongoDB query structure
                try:
                    if query.strip().startswith('{'):
                        parsed = json.loads(query)
                        if 'collection' not in parsed:
                            raise DataValidationError("MongoDB query must specify a collection")
                    else:
                        # Validate aggregation pipeline
                        pipeline = json.loads(query)
                        if not isinstance(pipeline, list):
                            raise DataValidationError("MongoDB aggregation must be an array")
                except json.JSONDecodeError:
                    raise DataValidationError("Invalid MongoDB query format")
                    
            elif db_type in ['postgresql', 'mysql']:
                # Basic SQL injection prevention
                dangerous_keywords = ['DROP', 'DELETE', 'TRUNCATE', 'UPDATE', 'INSERT']
                query_upper = query.upper()
                for keyword in dangerous_keywords:
                    if keyword in query_upper:
                        raise DataValidationError(f"Dangerous operation detected: {keyword}")
                        
        except Exception as e:
            raise DataValidationError(f"Query validation failed: {str(e)}") 