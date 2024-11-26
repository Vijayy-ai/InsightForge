import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { ErrorDetails } from '@/services/error-handling';

interface ErrorDisplayProps {
  error: ErrorDetails;
  className?: string;
}

export default function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
  const getErrorColor = (code: string) => {
    if (code.startsWith('API_4')) return 'red';
    if (code.startsWith('API_5')) return 'orange';
    return 'yellow';
  };

  return (
    <div className={`rounded-lg p-4 ${className}`} style={{ backgroundColor: `${getErrorColor(error.code)}50` }}>
      <div className="flex items-start">
        <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-800">
            Error: {error.code}
          </h3>
          <div className="mt-2 text-sm text-gray-700">
            <p>{error.message}</p>
            {error.details && (
              <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>
          {error.retry && (
            <button
              onClick={() => error.retry?.()}
              className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FiRefreshCw className="mr-1" />
              Retry Operation
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 