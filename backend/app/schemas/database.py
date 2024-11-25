from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union

class DatabaseConnectionRequest(BaseModel):
    """Database connection request schema"""
    type: str = Field(..., description="Database type (postgresql, mongodb)")
    host: str = Field(..., description="Database host")
    port: int = Field(..., description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Database username")
    password: str = Field(..., description="Database password")
    query: str = Field(..., description="Query to execute")

class DatabaseResponse(BaseModel):
    """Database response schema"""
    status: str = Field(..., description="Response status")
    data: Dict[str, Any] = Field(..., description="Query result data")
    connection_id: Optional[str] = Field(None, description="Connection ID for future use")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class QueryRequest(BaseModel):
    """Query request schema"""
    connection_id: str = Field(..., description="Connection ID from previous connection")
    query: str = Field(..., description="Query to execute")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Query parameters")

class QueryResponse(BaseModel):
    """Query response schema"""
    status: str = Field(..., description="Response status")
    data: List[Dict[str, Any]] = Field(..., description="Query results")
    columns: List[str] = Field(..., description="Column names")
    rows: int = Field(..., description="Number of rows returned")
    execution_time: Optional[float] = Field(None, description="Query execution time in seconds")

class ErrorResponse(BaseModel):
    """Error response schema"""
    status: str = Field("error", description="Error status")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

class ConnectionStatus(BaseModel):
    """Connection status schema"""
    connected: bool = Field(..., description="Connection status")
    connection_id: Optional[str] = Field(None, description="Active connection ID")
    database_type: Optional[str] = Field(None, description="Connected database type")
    database_name: Optional[str] = Field(None, description="Connected database name")
    error: Optional[ErrorResponse] = Field(None, description="Error details if connection failed")

class DatabaseStats(BaseModel):
    """Database statistics schema"""
    connection_time: float = Field(..., description="Time taken to establish connection")
    query_time: float = Field(..., description="Time taken to execute query")
    rows_affected: int = Field(..., description="Number of rows affected by query")
    cached: bool = Field(False, description="Whether result was cached")

class MongoDBQuery(BaseModel):
    """MongoDB specific query schema"""
    collection: str = Field(..., description="Collection name")
    filter: Optional[Dict[str, Any]] = Field({}, description="Query filter")
    projection: Optional[Dict[str, Any]] = Field(None, description="Field projection")
    sort: Optional[Dict[str, Any]] = Field(None, description="Sort criteria")
    limit: Optional[int] = Field(None, description="Maximum number of documents to return")
    skip: Optional[int] = Field(None, description="Number of documents to skip")

class PostgreSQLQuery(BaseModel):
    """PostgreSQL specific query schema"""
    query: str = Field(..., description="SQL query")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Query parameters")
    fetch_size: Optional[int] = Field(None, description="Number of rows to fetch at a time") 