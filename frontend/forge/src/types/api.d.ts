interface APIProcessedData {
  type: string;
  data_type?: string;
  data: any[];
  metadata?: {
    statistics?: {
      row_count: number;
      column_count: number;
      missing_values: Record<string, number>;
    };
    date_columns?: string[];
    numeric_columns?: string[];
    categorical_columns?: string[];
    columns?: string[];
    rows?: number;
    dtypes?: Record<string, string>;
    processed_at?: string;
  };
}

interface APIResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  processed_data?: APIProcessedData;
} 