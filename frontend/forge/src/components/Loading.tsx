import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Loading({ message = 'Loading...', size = 'medium' }: LoadingProps): JSX.Element {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`} 
           role="status" 
           aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
} 