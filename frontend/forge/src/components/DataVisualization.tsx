import React, { useMemo, useState, useCallback } from 'react';
import { EnhancedReport, Visualization, PlotlyData } from '@/types/report';
import PlotlyWrapper from './PlotlyWrapper';
import ErrorBoundary from './ErrorBoundary';
import { apiService } from '@/services/api';
import { FiAlertCircle } from 'react-icons/fi';
import Loading from './Loading';
import type { Data } from 'plotly.js';

interface DataVisualizationProps {
  report: EnhancedReport;
}

interface VisualizationData {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
  data: PlotlyData[];
  layout: Visualization['layout'];
}

interface PlotlyTrace extends PlotlyData {
  name: string;
  type: 'scatter' | 'bar' | 'box' | 'line' | 'pie' | 'heatmap';
}

const generateHoverTemplate = (trace: PlotlyTrace, dataType: string): string => {
  switch (dataType) {
    case 'time_series':
      return `${trace.name}<br>Value: %{y}<br>Time: %{x}<extra></extra>`;
    case 'categorical':
      return `${trace.name}<br>Count: %{y}<br>Category: %{x}<extra></extra>`;
    default:
      return `${trace.name}: %{y}<br>X: %{x}<extra></extra>`;
  }
};

interface ChartTypeSelectorProps {
  value: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
  onChange: (type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap') => void;
}

const ChartTypeSelector = ({ value, onChange }: ChartTypeSelectorProps) => (
  <select 
    value={value}
    onChange={(e) => onChange(e.target.value as 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap')}
    className="mb-4 px-3 py-2 border rounded"
    aria-label="Select chart type"
  >
    <option value="line">Line Chart</option>
    <option value="bar">Bar Chart</option>
    <option value="scatter">Scatter Plot</option>
    <option value="pie">Pie Chart</option>
    <option value="heatmap">Heatmap</option>
  </select>
);

export default function DataVisualization({ report }: DataVisualizationProps): JSX.Element {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'>(
    (report.visualizations.default_type || 'line') as 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const enhanceVisualizationData = useCallback((
    data: VisualizationData,
    dataType: string,
    type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'
  ): { data: Array<Partial<Data>>; layout: Visualization['layout']; type: string } => {
    const enhancedData = data.data.map((trace: PlotlyData) => ({
      ...trace,
      type,
      hovertemplate: generateHoverTemplate({ 
        ...trace, 
        name: trace.name || '', 
        type 
      }, dataType),
      hoverlabel: { bgcolor: '#FFF', font: { family: 'Inter, sans-serif' } },
      line: {
        width: 2,
        ...(trace.line as Record<string, unknown>)
      },
    })) as Array<Partial<Data>>;

    return {
      type,
      data: enhancedData,
      layout: {
        ...data.layout,
        showlegend: true,
      }
    };
  }, []);

  const vizData = useMemo(() => {
    try {
      const parsed = JSON.parse(report.visualizations.interactive) as VisualizationData;
      return enhanceVisualizationData(
        parsed, 
        report.data_type, 
        chartType as 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'
      );
    } catch (error) {
      console.error('Failed to parse visualization data:', error);
      setError('Failed to parse visualization data');
      return null;
    }
  }, [report.visualizations.interactive, report.data_type, chartType, enhanceVisualizationData]);

  const handleVisualizationError = useCallback((error: Error): void => {
    setError(error.message);
    console.error('Visualization error:', error);
  }, []);

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'csv'): Promise<void> => {
    try {
      setIsLoading(true);
      await apiService.exportData(report.visualizations.interactive, format);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }, [report.visualizations.interactive]);

  const exportButton = (
    <button 
      onClick={() => handleExport('png')}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
    >
      Export as PNG
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Visualization Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorBoundary>
        {vizData ? (
          <PlotlyWrapper
            data={vizData.data}
            layout={vizData.layout}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'visualization',
                height: 800,
                width: 1200,
                scale: 2
              },
            }}
            onError={handleVisualizationError}
          />
        ) : (
          <div className="text-center p-4 text-gray-500">
            No visualization data available
          </div>
        )}
      </ErrorBoundary>

      {exportButton}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <Loading message="Processing..." />
        </div>
      )}

      <div className="mb-4">
        <ChartTypeSelector 
          value={chartType} 
          onChange={(type) => setChartType(type)} 
        />
      </div>
    </div>
  );
} 