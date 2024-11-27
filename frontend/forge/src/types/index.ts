import { AxiosError } from 'axios';

// Data types
export interface DataPoint {
  timestamp?: string | Date;
  value: number;
  category?: string;
  [key: string]: string | number | Date | undefined;
}

export interface AnalysisData {
  [key: string]: DataPoint[] | number[] | string[];
}

export interface ProcessedData {
  type: 'structured' | 'unstructured';
  data_type?: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  data: Record<string, string | number | boolean | null>[];
  metadata?: {
    date_columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    statistics: {
      row_count: number;
      column_count: number;
      missing_values: Record<string, number>;
    };
    columns?: string[];
    rows?: number;
    dtypes?: Record<string, string>;
    processed_at?: string;
  };
  processed_data?: {
    type: string;
    data_type?: string;
    data: any[];
    metadata?: any;
  };
}

export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'api' | 'database';
  data: ProcessedData;
}

// Report types
export interface Visualization {
  plotly: string;
  static: string;
}

export interface Report {
  status: string;
  format?: 'json' | 'html' | 'pdf';
  analysis: string;
  content?: string;
  visualizations?: {
    interactive: string;
    static: string;
  };
  metadata?: ProcessedData['metadata'];
}

// Error types
export interface APIErrorResponse {
  detail: string;
  code?: string;
  status?: number;
}

export type APIError = AxiosError<APIErrorResponse>;

// API Response types
export interface APIResponse<T> {
  status: string;
  message?: string;
  data?: T;
} 