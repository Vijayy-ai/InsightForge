from typing import Union, Dict, Any, List
import pandas as pd
from fastapi import UploadFile
import json
import os
import io
import requests
from sqlalchemy import create_engine
import yaml
from datetime import datetime
import numpy as np

class DataProcessor:
    def __init__(self):
        pass
        
    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        content = await file.read()
        file_extension = file.filename.split('.')[-1].lower()
        
        try:
            data = None
            if file_extension in ['csv', 'xlsx', 'xls']:
                if file_extension == 'csv':
                    df = pd.read_csv(io.BytesIO(content))
                else:
                    df = pd.read_excel(io.BytesIO(content))
                data = self._process_dataframe(df)
            
            elif file_extension == 'json':
                json_data = json.loads(content)
                if isinstance(json_data, list):
                    df = pd.DataFrame(json_data)
                    data = self._process_dataframe(df)
                else:
                    data = {"type": "unstructured", "data": json_data}
            
            elif file_extension == 'txt':
                text_content = content.decode('utf-8')
                data = {
                    "type": "unstructured",
                    "data": {
                        "text": text_content,
                        "metadata": {
                            "file_name": file.filename,
                            "file_size": len(content),
                            "created_at": datetime.now().isoformat()
                        }
                    }
                }
            
            elif file_extension in ['yaml', 'yml']:
                yaml_data = yaml.safe_load(content)
                if isinstance(yaml_data, list):
                    df = pd.DataFrame(yaml_data)
                    data = self._process_dataframe(df)
                else:
                    data = {"type": "unstructured", "data": yaml_data}
            
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            return {
                "status": "success",
                "file_type": file_extension,
                "processed_data": data
            }
                
        except Exception as e:
            raise Exception(f"Error processing file: {str(e)}")

    def _process_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Process DataFrame and detect its characteristics"""
        
        # Detect date columns and convert them
        date_columns = []
        for col in df.columns:
            try:
                df[col] = pd.to_datetime(df[col])
                date_columns.append(col)
            except:
                continue

        # Detect numeric columns
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Detect categorical columns
        categorical_columns = df.select_dtypes(include=['object']).columns.tolist()
        
        # Basic statistics
        stats = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "missing_values": df.isnull().sum().to_dict()
        }

        # Determine data type
        data_type = self._detect_data_type(df, date_columns, numeric_columns)
        
        return {
            "type": "structured",
            "data_type": data_type,
            "data": df.to_dict(orient='records'),
            "metadata": {
                "date_columns": date_columns,
                "numeric_columns": numeric_columns,
                "categorical_columns": categorical_columns,
                "statistics": stats
            }
        }

    def _detect_data_type(self, df: pd.DataFrame, 
                         date_cols: List[str], 
                         numeric_cols: List[str]) -> str:
        """Detect the type of data for better visualization"""
        if date_cols and numeric_cols:
            return 'time_series'
        elif len(numeric_cols) > len(df.columns) * 0.7:
            return 'numerical'
        elif len(numeric_cols) > 0:
            return 'mixed'
        else:
            return 'categorical'

    async def process_api_data(self, api_url: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process data from external APIs"""
        try:
            response = requests.get(api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Try to convert to DataFrame if it's a list
            if isinstance(data, list):
                df = pd.DataFrame(data)
                return self._process_dataframe(df)
            
            return {
                "type": "unstructured",
                "data": data
            }
        except Exception as e:
            raise Exception(f"Error fetching API data: {str(e)}")

    async def process_database(self, connection_string: str, query: str) -> Dict[str, Any]:
        """Process data from databases"""
        try:
            engine = create_engine(connection_string)
            df = pd.read_sql(query, engine)
            return self._process_dataframe(df)
        except Exception as e:
            raise Exception(f"Error querying database: {str(e)}")