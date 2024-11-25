from typing import Dict, Any, Optional, TypedDict, List
import pandas as pd
from sqlalchemy import create_engine, text
from pymongo import MongoClient
from app.core.config import settings
from app.core.exceptions import DatabaseConnectionError

class QueryResult(TypedDict):
    data: List[Dict[str, Any]]
    columns: List[str]
    rows: int

class DatabaseConnector:
    def __init__(self):
        self.connections: Dict[str, Any] = {}

    async def connect(self, connection_params: Dict[str, Any]) -> QueryResult:
        # Ensure all required parameters are present
        required_keys = ['type', 'host', 'port', 'database', 'username', 'password', 'query']
        for key in required_keys:
            if key not in connection_params:
                raise DatabaseConnectionError(f"Missing parameter: {key}")
        try:
            db_type = connection_params['type']
            if db_type == 'postgresql':
                return await self._connect_postgresql(connection_params)
            elif db_type == 'mongodb':
                return await self._connect_mongodb(connection_params)
            else:
                raise DatabaseConnectionError(f"Unsupported database type: {db_type}")

        except Exception as e:
            raise DatabaseConnectionError(f"Failed to connect to database: {str(e)}")

    async def _connect_postgresql(self, params: Dict[str, Any]) -> QueryResult:
        connection_string = f"postgresql://{params['username']}:{params['password']}@{params['host']}:{params['port']}/{params['database']}"
        engine = create_engine(connection_string)
        
        try:
            with engine.connect() as connection:
                df = pd.read_sql(text(params['query']), connection)
                return {
                    "data": df.to_dict(orient='records'),
                    "columns": df.columns.tolist(),
                    "rows": len(df)
                }
        except Exception as e:
            raise DatabaseConnectionError(f"PostgreSQL query failed: {str(e)}")

    async def _connect_mongodb(self, params: Dict[str, Any]) -> QueryResult:
        try:
            client = MongoClient(
                f"mongodb://{params['username']}:{params['password']}@{params['host']}:{params['port']}"
            )
            db = client[params['database']]
            
            # Parse MongoDB query from string to dict
            import json
            query = json.loads(params['query'])
            
            collection = db[query.get('collection', 'default')]
            cursor = collection.find(query.get('filter', {}))
            
            df = pd.DataFrame(list(cursor))
            client.close()
            
            return {
                "data": df.to_dict(orient='records'),
                "columns": df.columns.tolist(),
                "rows": len(df)
            }
        except Exception as e:
            raise DatabaseConnectionError(f"MongoDB query failed: {str(e)}")

    async def execute_query(self, connection_id: str, query: str) -> QueryResult:
        if connection_id not in self.connections:
            raise DatabaseConnectionError("No active connection found")
            
        try:
            connection = self.connections[connection_id]
            df = pd.read_sql(query, connection)
            return {
                "data": df.to_dict(orient='records'),
                "columns": df.columns.tolist(),
                "rows": len(df)
            }
        except Exception as e:
            raise DatabaseConnectionError(f"Query execution failed: {str(e)}")