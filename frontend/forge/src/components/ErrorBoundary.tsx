'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      hasError: true
    });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-center mb-6">
              <FiAlertTriangle className="text-red-500 w-12 h-12" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Something went wrong
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-red-700">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm text-red-700 cursor-pointer">
                    View technical details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleDismiss}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Dismiss Error
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 