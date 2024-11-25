import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import DatabaseConnector from './DatabaseConnector';
import APIIntegration from './APIIntegration';
import { ProcessedData } from '@/types/common';

interface DataSourceProps {
  onDataLoad: (data: ProcessedData, sourceType: string) => void;
}

export default function DataSourceIntegration({ onDataLoad }: DataSourceProps) {
  const [activeSource, setActiveSource] = useState<'file' | 'database' | 'api'>('file');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Data Source Integration</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSource('file')}
          className={`px-4 py-2 rounded-lg ${
            activeSource === 'file' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          aria-label="Upload file"
        >
          File Upload
        </button>
        <button
          onClick={() => setActiveSource('database')}
          className={`px-4 py-2 rounded-lg ${
            activeSource === 'database' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          aria-label="Connect to database"
        >
          Database
        </button>
        <button
          onClick={() => setActiveSource('api')}
          className={`px-4 py-2 rounded-lg ${
            activeSource === 'api' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          aria-label="Connect to API"
        >
          API
        </button>
      </div>

      <div className="mt-4">
        {activeSource === 'file' && (
          <FileUploader onUpload={onDataLoad} />
        )}
        {activeSource === 'database' && (
          <DatabaseConnector onConnect={onDataLoad} />
        )}
        {activeSource === 'api' && (
          <APIIntegration onFetch={onDataLoad} />
        )}
      </div>
    </div>
  );
} 