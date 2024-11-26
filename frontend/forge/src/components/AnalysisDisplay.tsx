import React from 'react';
import { 
  TimeSeriesAnalysis, 
  NumericalAnalysis,
  CategoricalAnalysis,
  StatisticalSummary,
  DataQuality
} from '@/types/report';
import PlotlyWrapper from './PlotlyWrapper';
import DataQualityDisplay from './DataQualityDisplay';
import type { Data } from 'plotly.js';

interface AnalysisDisplayProps {
  analysis: {
    llm_analysis: string;
    insights: {
      summary_stats: Record<string, StatisticalSummary>;
    };
    statistical_analysis: {
      time_series: TimeSeriesAnalysis | null;
      numerical: NumericalAnalysis | null;
      categorical: CategoricalAnalysis | null;
    };
    data_quality: DataQuality;
  };
  dataType: 'time_series' | 'numerical' | 'categorical' | 'mixed';
}

interface Statistics {
  mean: number;
  median: number;
  std: number;
}

interface TrendData {
  mean: number;
  std: number;
  trend: string;
  trend_strength: number;
  trend_components: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
}

export default function AnalysisDisplay({ analysis, dataType }: AnalysisDisplayProps) {
  const llmAnalysis = analysis?.llm_analysis || 'No analysis available';
  const insights = analysis?.insights?.summary_stats || {};
  const statisticalAnalysis = analysis?.statistical_analysis || {};
  const dataQuality = analysis?.data_quality || {
    completeness: {},
    accuracy: {},
    consistency: {}
  };

  const renderStatisticalAnalysis = () => {
    if (!statisticalAnalysis) return null;
    
    switch (dataType) {
      case 'time_series': {
        const timeSeriesData = statisticalAnalysis.time_series;
        if (!timeSeriesData) return null;
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Time Series Analysis</h3>
            {timeSeriesData.trends && Object.entries(timeSeriesData.trends).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-gray-700">{key}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Mean</p>
                    <p className="font-medium">{(value as TrendData).mean?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trend</p>
                    <p className="font-medium capitalize">{(value as TrendData).trend || 'N/A'}</p>
                  </div>
                </div>
                {renderTrendPlot(timeSeriesData.trends)}
              </div>
            ))}
          </div>
        );
      }

      case 'numerical': {
        const numericalData = statisticalAnalysis.numerical;
        if (!numericalData) return null;
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Numerical Analysis</h3>
            {Object.entries(numericalData || {}).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-gray-700">{key}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Mean</p>
                    <p className="font-medium">{(value as Statistics).mean.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Median</p>
                    <p className="font-medium">{(value as Statistics).median.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'categorical': {
        const categoricalData = statisticalAnalysis.categorical;
        if (!categoricalData) return null;
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorical Analysis</h3>
            {Object.entries(categoricalData || {}).map(([key, frequencies]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-medium text-gray-700">{key}</h4>
                <div className="mt-2">
                  {Object.entries(frequencies as Record<string, number>).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-1">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const renderTrendPlot = (trends: TimeSeriesAnalysis['trends']) => {
    if (!trends) return null;
    
    const data = Object.entries(trends).map(([key, value]) => ({
      type: 'scatter' as const,
      name: key,
      y: value.trend_components?.trend || [],
      mode: 'lines' as const,
      line: { shape: 'spline' as const }
    }));

    return (
      <div className="mt-4">
        <PlotlyWrapper
          data={data as Array<Partial<Data>>}
          layout={{
            title: 'Trend Analysis',
            showlegend: true,
            height: 300
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4" id="analysis-results">Analysis Results</h2>
        <div className="prose max-w-none" role="region" aria-labelledby="analysis-results">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">LLM Analysis</h3>
            <p className="text-gray-700 whitespace-pre-line">{llmAnalysis}</p>
          </div>
          
          <div className="mb-6">
            {renderStatisticalAnalysis()}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(insights).map(([key, value]) => (
                <div 
                  key={key} 
                  className="bg-gray-50 p-4 rounded-lg"
                  role="article"
                  aria-label={`Key insight for ${key}`}
                >
                  <h4 className="font-medium text-gray-700">{key}</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DataQualityDisplay dataQuality={dataQuality} />
    </div>
  );
} 