from fastapi import UploadFile, HTTPException
import pandas as pd
import json
from typing import Dict, Any, Optional, Union
import io
import logging
import chardet
import numpy as np
from datetime import datetime

logger = logging.getLogger(__name__)

class FileService:
    ALLOWED_EXTENSIONS = {
        'csv': ['text/csv', 'application/csv'],
        'json': ['application/json'],
        'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'txt': ['text/plain'],
        'log': ['text/plain']
    }

    async def read_file(self, file: UploadFile) -> Dict[str, Any]:
        """Read and process uploaded file"""
        try:
            content = await file.read()
            file_extension = file.filename.split('.')[-1].lower()
            
            # Handle different file types
            if file_extension in ['csv', 'xlsx', 'xls']:
                return await self._process_structured_data(content, file_extension)
            elif file_extension == 'json':
                return await self._process_json_data(content)
            elif file_extension in ['txt', 'log']:
                return await self._process_text_data(content)
            else:
                return await self._process_binary_data(content, file_extension)
            
        except Exception as e:
            logger.error(f"File processing error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file: {str(e)}"
            )

    async def _process_structured_data(self, content: bytes, extension: str) -> Dict[str, Any]:
        """Process structured data files (CSV, Excel)"""
        try:
            if extension == 'csv':
                # Try different encodings
                encodings = ['utf-8', 'latin1', 'cp1252']
                df = None
                for encoding in encodings:
                    try:
                        df = pd.read_csv(io.BytesIO(content), encoding=encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                
                if df is None:
                    raise ValueError("Unable to decode CSV file with supported encodings")
            else:
                df = pd.read_excel(io.BytesIO(content))

            # Handle missing values and data type inference
            df = df.replace({np.nan: None})
            
            return {
                "type": "structured",
                "data": df.to_dict(orient='records'),
                "metadata": {
                    "columns": list(df.columns),
                    "rows": len(df),
                    "dtypes": df.dtypes.astype(str).to_dict()
                }
            }
        except Exception as e:
            raise ValueError(f"Error processing structured data: {str(e)}")

    async def _process_json_data(self, content: bytes) -> Dict[str, Any]:
        """Process JSON data with better error handling"""
        try:
            data = json.loads(content)
            if isinstance(data, list):
                # Try to convert to DataFrame for structured data
                try:
                    df = pd.DataFrame(data)
                    return {
                        "type": "structured",
                        "data": data,
                        "metadata": {
                            "columns": list(df.columns),
                            "rows": len(df),
                            "dtypes": df.dtypes.astype(str).to_dict()
                        }
                    }
                except:
                    pass
            
            # Handle as unstructured data
            return {
                "type": "unstructured",
                "data": data,
                "metadata": {
                    "size": len(content),
                    "format": "json"
                }
            }
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")

    async def _process_text_data(self, content: bytes) -> Dict[str, Any]:
        """Process text files with encoding detection"""
        try:
            # Detect encoding
            result = chardet.detect(content)
            encoding = result['encoding'] or 'utf-8'
            
            text = content.decode(encoding)
            
            # Try to detect if it's structured (e.g., CSV-like)
            lines = text.split('\n')
            if len(lines) > 1:
                delimiter = self._detect_delimiter(lines[0])
                if delimiter:
                    try:
                        df = pd.read_csv(io.StringIO(text), sep=delimiter)
                        return {
                            "type": "structured",
                            "data": df.to_dict(orient='records'),
                            "metadata": {
                                "columns": list(df.columns),
                                "rows": len(df),
                                "dtypes": df.dtypes.astype(str).to_dict()
                            }
                        }
                    except:
                        pass
            
            return {
                "type": "unstructured",
                "data": {
                    "text": text,
                    "lines": len(lines)
                },
                "metadata": {
                    "encoding": encoding,
                    "size": len(content)
                }
            }
        except Exception as e:
            raise ValueError(f"Error processing text data: {str(e)}")

    def _detect_delimiter(self, header_line: str) -> Optional[str]:
        """Detect the delimiter in a potential CSV header line"""
        common_delimiters = [',', ';', '\t', '|']
        max_count = 0
        best_delimiter = None
        
        for delimiter in common_delimiters:
            count = header_line.count(delimiter)
            if count > max_count:
                max_count = count
                best_delimiter = delimiter
        
        return best_delimiter if max_count > 0 else None

    async def _process_binary_data(self, content: bytes, extension: str) -> Dict[str, Any]:
        """Process binary files"""
        # Implement binary file processing logic here
        pass

    def _determine_data_type(self, df: pd.DataFrame) -> str:
        """Determine the type of data in the DataFrame"""
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

    async def process_unstructured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process unstructured data in background"""
        try:
            # Extract text content if available
            text_content = data.get('text', '')
            if text_content:
                # Basic text analysis
                stats = {
                    'character_count': len(text_content),
                    'word_count': len(text_content.split()),
                    'line_count': len(text_content.splitlines()),
                }
                
                # Update metadata
                return {
                    "type": "unstructured",
                    "data": data,
                    "metadata": {
                        "statistics": stats,
                        "processed": True,
                        "processed_at": datetime.now().isoformat()
                    }
                }
            
            return {
                "type": "unstructured",
                "data": data,
                "metadata": {
                    "processed": False,
                    "reason": "No text content found"
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing unstructured data: {str(e)}")
            return {
                "type": "unstructured",
                "data": data,
                "metadata": {
                    "processed": False,
                    "error": str(e)
                }
            } 