import React, { useState, useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { apiService } from '@/services/api';
import Loading from './Loading';
import { DatabaseConnectionParams } from '@/types/database';
import { ProcessedData } from '@/types/common';

interface DatabaseConnectorProps {
  onConnect: (data: ProcessedData, sourceType: string) => void;
}

interface MongoDBQueryBuilderProps {
  onChange: (query: string) => void;
}

// MongoDB query helper component
const MongoDBQueryBuilder = ({ onChange }: MongoDBQueryBuilderProps) => {
  const [queryType, setQueryType] = useState<'find' | 'aggregate'>('find');
  const [collection, setCollection] = useState('');
  const [filter, setFilter] = useState('{}');
  const [pipeline, setPipeline] = useState('[]');

  useEffect(() => {
    if (queryType === 'find') {
      const query = {
        collection,
        filter: JSON.parse(filter || '{}'),
      };
      onChange(JSON.stringify(query, null, 2));
    } else {
      try {
        const pipelineArray = JSON.parse(pipeline || '[]');
        if (collection) {
          pipelineArray.unshift({ $collection: collection });
        }
        onChange(JSON.stringify(pipelineArray, null, 2));
      } catch (e) {
        console.error('Invalid pipeline JSON:', e);
      }
    }
  }, [queryType, collection, filter, pipeline, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="queryType" className="block text-sm font-medium text-gray-700">
          Query Type
        </label>
        <select
          id="queryType"
          value={queryType}
          onChange={(e) => setQueryType(e.target.value as 'find' | 'aggregate')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-label="Select query type"
          title="Select query type"
        >
          <option value="find">Find Query</option>
          <option value="aggregate">Aggregation Pipeline</option>
        </select>
      </div>

      <div>
        <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
          Collection Name
        </label>
        <input
          id="collection"
          type="text"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          placeholder="Collection name"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-label="Enter collection name"
        />
      </div>

      {queryType === 'find' ? (
        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
            Filter Query
          </label>
          <textarea
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter (JSON)"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-label="Enter filter query in JSON format"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700">
            Aggregation Pipeline
          </label>
          <textarea
            id="pipeline"
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value)}
            placeholder="Aggregation Pipeline (JSON Array)"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-label="Enter aggregation pipeline in JSON array format"
          />
        </div>
      )}
    </div>
  );
};

export default function DatabaseConnector({ onConnect }: DatabaseConnectorProps) {
  const [formData, setFormData] = useState<DatabaseConnectionParams>({
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    query: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.connectDatabase(formData);
      
      // Handle the processed data response
      onConnect(response.data as ProcessedData, 'database');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Database connection form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dbType" className="block text-sm font-medium text-gray-700">
            Database Type
          </label>
          <select
            id="dbType"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DatabaseConnectionParams['type'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>

        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700">
            Host
          </label>
          <input
            id="host"
            type="text"
            value={formData.host}
            onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Port, Database, Username, Password fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700">
            Port
          </label>
          <input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value, 10) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="database" className="block text-sm font-medium text-gray-700">
            Database
          </label>
          <input
            id="database"
            type="text"
            value={formData.database}
            onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700">
          SQL Query
        </label>
        <textarea
          id="query"
          value={formData.query}
          onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          placeholder="SELECT * FROM table WHERE..."
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loading size="small" /> : 'Connect to Database'}
      </button>
    </form>
  );
} 