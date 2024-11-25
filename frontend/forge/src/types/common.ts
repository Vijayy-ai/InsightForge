export interface ProcessedData {
  type: 'structured' | 'unstructured';
  data: Record<string, string | number | boolean | null>[];
  data_type: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  metadata: {
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

export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  data: ProcessedData;
}

export type DataValue = string | number | boolean | null;
export type DataRecord = Record<string, DataValue>; 