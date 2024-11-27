import { DataSource } from '@/types/common';
import type { Data as PlotlyData, Layout as PlotlyLayout } from 'plotly.js';

export type ReportFormat = 'json' | 'pdf' | 'html';

export interface DataQualityStats {
  unique_count: number;
  duplicate_percentage: number;
}

export interface DataQuality {
  completeness: {
    score: number;
    missing_values: Record<string, number>;
    total_records: number;
  };
  accuracy: {
    score: number;
    invalid_values: Record<string, number>;
  };
  consistency: {
    score: number;
    inconsistencies: Record<string, string[]>;
  };
}

export interface TimeSeriesAnalysis {
  trend: string;
  seasonality: string;
  outliers: number[];
  forecast?: number[];
  trends?: Record<string, {
    mean: number;
    std: number;
    trend: string;
    trend_strength: number;
    trend_components?: {
      trend: number[];
      seasonal: number[];
      residual: number[];
    };
  }>;
}

export interface NumericalAnalysis {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  quartiles: [number, number, number];
}

export interface CategoricalAnalysis {
  unique_values: number;
  most_common: [string, number][];
  distribution: Record<string, number>;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  confidence: number;
}

export interface NumericalStatistics {
  correlation_matrix?: Record<string, Record<string, number>>;
  summary_stats: Record<string, NumericalAnalysis>;
}

export interface StatisticalSummary {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  count?: number;
  percentiles?: Record<string, number>;
}

export interface AnalysisResult {
  llm_analysis: string;
  insights: {
    summary_stats: Record<string, StatisticalSummary>;
  };
  statistical_analysis?: {
    time_series?: TimeSeriesAnalysis;
    numerical?: NumericalAnalysis;
    categorical?: CategoricalAnalysis;
  };
  data_quality: DataQuality;
}

export interface VisualizationResponse {
  type: string;
  data: Array<Partial<PlotlyData>>;
  layout: Partial<PlotlyLayout>;
  config?: {
    responsive?: boolean;
    displayModeBar?: boolean;
    [key: string]: any;
  };
}

export interface StatisticalAnalysis {
  time_series: TimeSeriesAnalysis | null;
  numerical: NumericalAnalysis | null;
  categorical: CategoricalAnalysis | null;
}

export interface AnalysisInsights {
  summary_stats: Record<string, StatisticalSummary>;
  trends?: Record<string, TrendAnalysis>;
  correlations?: Record<string, number>;
}

export interface EnhancedReport {
  id: string;
  data_type: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  analysis: {
    llm_analysis: string;
    insights: AnalysisInsights;
    statistical_analysis: StatisticalAnalysis;
    data_quality: DataQuality;
  };
  visualizations: VisualizationResponse[];
  metadata: {
    created_at: string;
    updated_at: string;
    source: {
      type: string;
      name: string;
    };
    rows: number;
    columns: number;
  };
}

export interface ReportGenerationOptions {
  format: 'json' | 'pdf' | 'html';
  includeVisualizations: boolean;
  includeTables: boolean;
  customizations?: {
    theme?: 'light' | 'dark';
    fontSize?: number;
    colors?: string[];
  };
}

export interface DataProcessingOptions {
  cleanMissingValues?: boolean;
  removeOutliers?: boolean;
  normalizeData?: boolean;
  aggregationType?: 'sum' | 'mean' | 'median';
  timeframe?: 'daily' | 'weekly' | 'monthly';
} 