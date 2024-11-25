import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import Loading from './Loading';
import { ProcessedData } from '@/types/common';

interface APIIntegrationProps {
  onFetch: (data: ProcessedData, sourceType: string) => void;
}

interface FormData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: string;
  body: string;
  authType: 'none' | 'apiKey' | 'basic';
  apiKey: string;
  username: string;
  password: string;
}

export default function APIIntegration({ onFetch }: APIIntegrationProps): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    method: 'GET',
    headers: '',
    body: '',
    authType: 'none',
    apiKey: '',
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers = formData.headers ? JSON.parse(formData.headers) : {};
      if (typeof headers !== 'object') throw new Error('Invalid headers format');
      const body = formData.body ? JSON.parse(formData.body) : undefined;

      // Add authentication headers
      if (formData.authType === 'apiKey') {
        headers['Authorization'] = `Bearer ${formData.apiKey}`;
      } else if (formData.authType === 'basic') {
        const basicAuth = btoa(`${formData.username}:${formData.password}`);
        headers['Authorization'] = `Basic ${basicAuth}`;
      }

      const response = await fetch(formData.url, {
        method: formData.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: formData.method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      onFetch(data as ProcessedData, 'api');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch API data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="API integration form">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          URL
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          placeholder="Enter API URL"
          title="API URL"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Method
          </label>
          <select
            value={formData.method}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE'
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="HTTP Method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Authentication
          </label>
          <select
            value={formData.authType}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              authType: e.target.value as 'none' | 'apiKey' | 'basic'
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="Authentication Type"
          >
            <option value="none">None</option>
            <option value="apiKey">API Key</option>
            <option value="basic">Basic Auth</option>
          </select>
        </div>
      </div>

      {formData.authType === 'apiKey' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter API Key"
            title="API Key"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                API Error
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
        {loading ? <Loading size="small" /> : 'Fetch Data'}
      </button>
    </form>
  );
} 