export interface ProcessedData {
  type: 'structured' | 'unstructured';
  data: Record<string, unknown>;
  data_type?: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  metadata?: {
    date_columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    statistics: {
      row_count: number;
      column_count: number;
      missing_values: Record<string, number>;
    };
  };
}

export interface PlotlyData {
  type?: string;
  name?: string;
  x?: (string | number)[];
  y?: (string | number)[];
  mode?: string;
  line?: {
    shape?: string;
    width?: number;
  };
  [key: string]: unknown;
}

export interface VisualizationData {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
  data: PlotlyData[];
  layout: {
    title?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
}

export interface UploadResponse {
  status: string;
  processed_data: {
    type: 'structured' | 'unstructured';
    data: Record<string, unknown>;
  };
} 