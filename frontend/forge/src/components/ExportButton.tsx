import React from 'react';
import { VisualizationResponse } from '@/types/report';
import { FiDownload } from 'react-icons/fi';

interface ExportButtonProps {
  data: VisualizationResponse;
  format: 'png' | 'svg' | 'jpeg';
  filename: string;
  onError: (error: Error) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  format,
  filename,
  onError
}) => {
  const handleExport = async () => {
    try {
      const plotlyDiv = document.querySelector('.js-plotly-plot') as HTMLElement;
      if (!plotlyDiv) {
        throw new Error('Plot element not found');
      }

      const plotly = await import('plotly.js-dist-min');
      const imageData = await plotly.toImage(plotlyDiv, {
        format: format,
        width: 1200,
        height: 800,
        scale: 2
      });

      // Create download link
      const link = document.createElement('a');
      link.href = imageData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      onError(error instanceof Error ? error : new Error('Export failed'));
    }
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      title={`Export as ${format.toUpperCase()}`}
    >
      <FiDownload className="mr-1" />
      Export {format.toUpperCase()}
    </button>
  );
};

export default ExportButton; 