import { ProcessedData } from '@/types/common';

export interface DatabaseConnectionParams {
  type: 'postgresql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  query: string;
}

export interface DatabaseConnectionError {
  message: string;
  code?: string;
  details?: {
    query?: string;
    params?: Record<string, unknown>;
  };
}

export interface QueryResult {
  data: Array<Record<string, unknown>>;
  columns: string[];
  rows: number;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: {
    query?: string;
    params?: Record<string, unknown>;
  };
}

export interface ConnectionStatus {
  connected: boolean;
  connectionId?: string;
  error?: DatabaseError;
}

export interface QueryOptions {
  timeout?: number;
  fetchSize?: number;
  parameters?: Record<string, unknown>;
}

export interface DatabaseStats {
  connectionTime: number;
  queryTime: number;
  rowsAffected: number;
  cached: boolean;
}

export type DatabaseType = 'postgresql' | 'mongodb';

export interface DatabaseConfig {
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  enableCaching: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface DatabaseResponse {
  status: string;
  data: ProcessedData;
  connection_id?: string;
} 