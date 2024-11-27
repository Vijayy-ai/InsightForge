export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retry?: () => Promise<any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  errors?: ValidationError[];
  details?: Record<string, unknown>;
} 