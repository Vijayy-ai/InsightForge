import React, { useState } from 'react';
import { EnhancedReport, VisualizationResponse } from '@/types/report';
import PlotlyWrapper from './PlotlyWrapper';
import ExportButton from './ExportButton';
import type { Layout } from 'plotly.js';

interface DataVisualizationProps {
  report: EnhancedReport;
}

export default function DataVisualization({ report }: DataVisualizationProps) {
  const [error, setError] = useState<string | null>(null);

  if (!report?.visualizations || report.visualizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Visualizations</h2>
        <p className="text-gray-600">No visualizations available for this data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Visualizations</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {report.visualizations.map((visualization: VisualizationResponse, index: number) => (
          <div key={index} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {visualization.type || `Visualization ${index + 1}`}
              </h3>
              <div className="flex space-x-2 mt-4">
                <ExportButton
                  data={visualization}
                  format="png"
                  filename={`visualization_${Date.now()}.png`}
                  onError={(err) => setError(err.message)}
                />
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <PlotlyWrapper
                data={visualization.data}
                layout={{
                  ...visualization.layout,
                  width: undefined,
                  height: 500,
                  autosize: true
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  ...visualization.config
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 