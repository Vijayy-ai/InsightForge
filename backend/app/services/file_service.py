from fastapi import UploadFile, HTTPException
import pandas as pd
import json
from typing import Dict, Any
import io
import logging
import chardet

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
        """Read and parse uploaded file"""
        try:
            # Verify file type
            extension = file.filename.split('.')[-1].lower()
            if extension not in self.ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {extension}"
                )

            # Read file content
            content = await file.read()
            
            # Detect file encoding
            encoding = chardet.detect(content)['encoding'] or 'utf-8'
            
            # Process based on file type
            if extension == 'csv':
                return await self._process_csv(content, encoding)
            elif extension == 'json':
                return await self._process_json(content, encoding)
            elif extension == 'xlsx':
                return await self._process_excel(content)
            elif extension in ['txt', 'log']:
                return await self._process_text(content, encoding)
            
        except Exception as e:
            logger.error(f"File reading failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"File processing failed: {str(e)}"
            )
        finally:
            await file.seek(0)  # Reset file pointer

    async def _process_csv(self, content: bytes, encoding: str) -> Dict[str, Any]:
        """Process CSV file"""
        try:
            df = pd.read_csv(io.BytesIO(content), encoding=encoding)
            return {
                "type": "structured",
                "data": df.to_dict('records'),
                "data_type": self._determine_data_type(df)
            }
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid CSV file: {str(e)}"
            )

    async def _process_json(self, content: bytes, encoding: str) -> Dict[str, Any]:
        """Process JSON file"""
        try:
            data = json.loads(content.decode(encoding))
            if isinstance(data, list):
                df = pd.DataFrame(data)
            else:
                df = pd.DataFrame([data])
            return {
                "type": "structured",
                "data": df.to_dict('records'),
                "data_type": self._determine_data_type(df)
            }
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid JSON file: {str(e)}"
            )

    async def _process_excel(self, content: bytes) -> Dict[str, Any]:
        """Process Excel file"""
        try:
            df = pd.read_excel(io.BytesIO(content))
            return {
                "type": "structured",
                "data": df.to_dict('records'),
                "data_type": self._determine_data_type(df)
            }
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Excel file: {str(e)}"
            )

    async def _process_text(self, content: bytes, encoding: str) -> Dict[str, Any]:
        """Process text file"""
        try:
            text = content.decode(encoding)
            return {
                "type": "unstructured",
                "data": {"text": text},
                "data_type": "text"
            }
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid text file: {str(e)}"
            )

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