import { DataSource } from '@/types/common';

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

export interface PlotlyData {
  type?: 'scatter' | 'bar' | 'box' | 'line' | 'pie' | 'heatmap';
  x?: (string | number)[] | string[] | number[];
  y?: (string | number)[] | string[] | number[];
  mode?: 'lines' | 'markers' | 'lines+markers';
  name?: string;
  line?: {
    shape?: 'linear' | 'spline';
    width?: number;
  };
  [key: string]: unknown;
}

export interface PlotlyLayout {
  title?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface Visualization {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
  data: PlotlyData[];
  layout: PlotlyLayout;
  config?: Record<string, unknown>;
}

export interface EnhancedReport {
  id: string;
  data_type: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  analysis: AnalysisResult;
  visualizations: {
    interactive: string;
    static: string[];
    default_type: string;
  };
  data_quality: DataQuality;
  metadata: {
    created_at: string;
    updated_at: string;
    source: DataSource;
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
    colors?: string[];
    fontSize?: number;
  };
}

export interface DataProcessingOptions {
  cleanMissingValues?: boolean;
  removeOutliers?: boolean;
  normalizeData?: boolean;
  aggregationType?: 'sum' | 'mean' | 'median';
  timeframe?: 'daily' | 'weekly' | 'monthly';
} 