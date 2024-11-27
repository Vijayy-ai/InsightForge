'use client';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { DataSource } from '@/types';
import ChatbotInterface from '../components/Chatbot';
import Link from 'next/link';
import Loading from '@/components/Loading';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import DataVisualization from '@/components/DataVisualization';
import { EnhancedReport } from '@/types/report';
import ReportExportOptions from '@/components/ReportExportOptions';
import { ReportGenerationOptions } from '@/types/report';
import { ReportFormat } from '@/types/report';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<EnhancedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ReportGenerationOptions>({
    format: 'json' as ReportFormat,
    includeVisualizations: true,
    includeTables: true,
    customizations: {
      theme: 'dark',
      fontSize: 12,
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.uploadFile(file);
      const processedData = response.processed_data;
      
      // Ensure data is an array
      const dataArray = Array.isArray(processedData.data) 
        ? processedData.data 
        : [processedData.data];

      const newDataSource: DataSource = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'file',
        data: {
          type: processedData.type,
          data_type: processedData.data_type,
          data: dataArray.map(item => {
            if (typeof item !== 'object' || item === null) {
              return { value: item };
            }
            
            const typedItem: Record<string, string | number | boolean | null> = {};
            Object.entries(item).forEach(([key, value]) => {
              if (value === undefined) {
                typedItem[key] = null;
              } else if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                value === null
              ) {
                typedItem[key] = value;
              } else {
                typedItem[key] = String(value);
              }
            });
            return typedItem;
          }),
          metadata: {
            date_columns: processedData.metadata?.date_columns || [],
            numeric_columns: processedData.metadata?.numeric_columns || [],
            categorical_columns: processedData.metadata?.categorical_columns || [],
            statistics: {
              row_count: processedData.metadata?.statistics?.row_count || 0,
              column_count: processedData.metadata?.statistics?.column_count || 0,
              missing_values: processedData.metadata?.statistics?.missing_values || {}
            },
            columns: processedData.metadata?.columns || [],
            rows: processedData.metadata?.rows || 0,
            dtypes: processedData.metadata?.dtypes || {},
            processed_at: processedData.metadata?.processed_at
          }
        }
      };
      setDataSources(prev => [...prev, newDataSource]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!dataSources.length || !query) return;

    try {
      setLoading(true);
      setError('');

      const reportData = {
        ...dataSources[0].data,
        data: Array.isArray(dataSources[0].data.data) 
          ? dataSources[0].data.data 
          : [dataSources[0].data.data]
      };

      const response = await apiService.generateReport(
        reportData as Record<string, unknown>,
        query,
        exportOptions.format,
        {
          cleanMissingValues: exportOptions.includeVisualizations,
          removeOutliers: false,
          normalizeData: false,
          aggregationType: 'mean',
          timeframe: 'daily'
        }
      );

      if (exportOptions.format === 'json') {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }
        setReport(response as EnhancedReport);
      } else {
        // Handle PDF/HTML download
        const blob = response as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        if (exportOptions.format === 'pdf') {
          link.download = `report_${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.open(url, '_blank');
        }
        
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Report generation error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to generate report. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!report) return null;

    return (
      <div className="space-y-8">
        <AnalysisDisplay 
          analysis={report.analysis}
          dataType={report.data_type as "time_series" | "numerical" | "categorical"}
        />
        <DataVisualization report={report} />
      </div>
    );
  };

  const handleQuickAction = (action: 'generate' | 'connect' | 'explore') => {
    switch (action) {
      case 'generate':
        setShowReportModal(true);
        break;
      // Add other cases as needed
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#111827]">
      {/* Sidebar */}
      <div className="w-64 bg-[#111827] text-white border-r border-gray-800">
        <div className="p-6">
          <h1 className="text-xl font-mono mb-8 text-blue-400">insightforge</h1>
          <nav className="space-y-4">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/data-sources" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <span>Data Sources</span>
            </Link>
            <Link 
              href="/reports" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
              <span>Reports</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-8">Dashboard</h2>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => handleQuickAction('generate')}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Generate new insights</h3>
                  <p className="text-gray-400">Create a new analysis report</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('connect')}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3S4 5 4 7zm12 0v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3S16 5 16 7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Connect your data</h3>
                  <p className="text-gray-400">Import from various sources</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('explore')}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Explore your data</h3>
                  <p className="text-gray-400">View insights and trends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg text-white">Total Reports</h4>
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg text-white">Active Reports</h4>
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg text-white">Visualizations</h4>
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Recent Reports</h3>
            <div className="bg-gray-800 rounded-lg p-6">
              {dataSources.length > 0 ? (
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-white">
                          <p className="font-semibold">{source.name}</p>
                          <p className="text-sm text-gray-400">{source.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No reports generated yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Generate Report</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Data File
                  </label>
                  <div className="bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300">Drag and drop your file here, or click to browse</p>
                        <p className="text-sm text-gray-400 mt-1">Supported file types:</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-gray-600 rounded-md text-xs text-gray-300">
                            CSV (.csv)
                          </span>
                          <span className="px-2 py-1 bg-gray-600 rounded-md text-xs text-gray-300">
                            Excel (.xlsx, .xls)
                          </span>
                          <span className="px-2 py-1 bg-gray-600 rounded-md text-xs text-gray-300">
                            JSON (.json)
                          </span>
                          <span className="px-2 py-1 bg-gray-600 rounded-md text-xs text-gray-300">
                            Text (.txt)
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Maximum file size: 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".csv,.xlsx,.xls,.json,.txt"
                        title="Upload data file"
                        aria-label="Upload data file"
                      />
                      <label
                        htmlFor="file-upload"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                    {dataSources.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                        <p className="text-sm text-gray-300">
                          Current file: {dataSources[dataSources.length - 1].name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Query Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Analysis Query
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe the analysis you want to perform..."
                  />
                </div>

                {/* Export Options */}
                <ReportExportOptions
                  options={exportOptions}
                  onChange={setExportOptions}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={generateReport}
                disabled={loading || !dataSources.length || !query}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loading /> : 'Generate Report'}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <ChatbotInterface />

      {report && (
        <div className="mt-8">
          {renderAnalysisResults()}
        </div>
      )}
    </div>
  );
}
