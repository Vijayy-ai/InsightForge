from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy import create_engine, text
from pymongo import MongoClient
from ..core.exceptions import DatabaseConnectionError
import logging
import json

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.connections = {}
        self.logger = logger

    async def connect(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Connect to database and execute query"""
        try:
            db_type = params['type']
            connection_id = f"{db_type}_{params['host']}_{params['database']}"
            
            if db_type == 'postgresql':
                result = await self._connect_postgresql(params)
            elif db_type == 'mongodb':
                result = await self._connect_mongodb(params)
            else:
                raise DatabaseConnectionError(f"Unsupported database type: {db_type}")

            # Store connection for future use
            self.connections[connection_id] = {
                "connection": result["connection"],
                "type": db_type
            }

            return {
                "connection_id": connection_id,
                "data": result["data"]
            }

        except Exception as e:
            self.logger.error(f"Database connection error: {str(e)}")
            raise DatabaseConnectionError(f"Failed to connect to database: {str(e)}")

    async def _connect_postgresql(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Connect to PostgreSQL database"""
        connection_string = f"postgresql://{params['username']}:{params['password']}@{params['host']}:{params['port']}/{params['database']}"
        engine = create_engine(connection_string)
        
        try:
            with engine.connect() as connection:
                df = pd.read_sql(text(params['query']), connection)
                return {
                    "connection": engine,
                    "data": df.to_dict('records')
                }
        except Exception as e:
            raise DatabaseConnectionError(f"PostgreSQL query failed: {str(e)}")

    async def _connect_mongodb(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Connect to MongoDB database and execute query"""
        try:
            connection_string = f"mongodb://{params['username']}:{params['password']}@{params['host']}:{params['port']}"
            client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            db = client[params['database']]
            
            # Parse and execute MongoDB query
            if params['query'].strip().startswith('{'):
                # Query is a JSON string
                query = json.loads(params['query'])
                collection_name = query.get('collection')
                filter_dict = query.get('filter', {})
                projection = query.get('projection', None)
                
                if not collection_name:
                    raise ValueError("MongoDB query must specify a collection")
                    
                collection = db[collection_name]
                cursor = collection.find(filter_dict, projection)
                
                # Convert cursor to list of dictionaries
                data = list(cursor)
                
                # Convert ObjectId to string for JSON serialization
                for doc in data:
                    if '_id' in doc:
                        doc['_id'] = str(doc['_id'])
                        
                return {
                    "connection": client,
                    "data": data
                }
            else:
                # Support for aggregation pipeline
                pipeline = json.loads(params['query'])
                collection_name = pipeline[0].get('$collection', pipeline[0].get('from'))
                
                if not collection_name:
                    raise ValueError("MongoDB aggregation must specify a collection")
                    
                collection = db[collection_name]
                result = list(collection.aggregate(pipeline))
                
                # Convert ObjectId to string
                for doc in result:
                    if '_id' in doc:
                        doc['_id'] = str(doc['_id'])
                        
                return {
                    "connection": client,
                    "data": result
                }
                
        except Exception as e:
            raise DatabaseConnectionError(f"MongoDB connection/query failed: {str(e)}")

    # Similar implementations for MySQL and MongoDB... 