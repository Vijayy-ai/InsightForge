export interface CommonDataTypes {
  string: string;
  number: number;
  boolean: boolean;
  null: null;
  undefined: undefined;
  object: object;
  array: any[];
}

export type BasicDataValue = CommonDataTypes[keyof CommonDataTypes];
export type DataValue = string | number | boolean | null;
export type DataRecord = Record<string, DataValue>;

export interface ProcessedDataResponse {
  processed_data: ProcessedData;
  [key: string]: any;
}

export interface ProcessedData {
  type: 'structured' | 'unstructured';
  data: Record<string, unknown>[] | Record<string, unknown>;
  data_type?: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  metadata?: {
    columns?: string[];
    rows?: number;
    dtypes?: Record<string, string>;
    date_columns?: string[];
    numeric_columns?: string[];
    categorical_columns?: string[];
    statistics?: {
      row_count: number;
      column_count: number;
      missing_values: Record<string, number>;
    };
    encoding?: string;
    size?: number;
    format?: string;
    background_processing?: boolean;
    processed?: boolean;
    processed_at?: string;
  };
}

export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  data: ProcessedData;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
  