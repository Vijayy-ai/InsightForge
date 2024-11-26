import React, { useState } from 'react';
import { FiDownload, FiAlertCircle } from 'react-icons/fi';
import { exportService } from '@/services/export';
import Loading from './Loading';

interface ExportButtonProps {
  data: Record<string, unknown>;
  format: 'png' | 'svg' | 'pdf';
  filename?: string;
  className?: string;
  onError?: (error: Error) => void;
}

export default function ExportButton({
  data,
  format,
  filename = `export_${Date.now()}.${format}`,
  className = '',
  onError
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await exportService.exportVisualization(data, format);
      exportService.downloadBlob(blob, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="small" />;
  }

  return (
    <div className="inline-block">
      <button
        onClick={handleExport}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${className}`}
        title={`Export as ${format.toUpperCase()}`}
      >
        <FiDownload className="w-4 h-4" />
        <span>Export {format.toUpperCase()}</span>
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <FiAlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 