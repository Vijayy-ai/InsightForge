import { AxiosError } from 'axios';

export interface ErrorDetails {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  retry?: () => Promise<any>;
}

export class ErrorHandlingService {
  static async handleError(
    error: unknown,
    context: string,
    retryCallback?: () => Promise<any>
  ): Promise<ErrorDetails> {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      // Handle specific error cases
      switch (status) {
        case 400:
          return {
            message: `Invalid request: ${detail || 'Bad request'}`,
            code: 'API_400',
            details: error.response?.data
          };
        case 422:
          return {
            message: `Data validation failed: ${detail || 'Invalid data'}`,
            code: 'API_422',
            details: error.response?.data
          };
        case 500:
          if (retryCallback && this.shouldRetry(error)) {
            return {
              message: `Server error: ${detail || 'Internal server error'}`,
              code: 'API_500',
              details: error.response?.data,
              retry: retryCallback
            };
          }
          return {
            message: `Server error: ${detail || 'Internal server error'}`,
            code: 'API_500',
            details: error.response?.data
          };
        default:
          return {
            message: `${context} failed: ${detail || error.message}`,
            code: `API_${status || 'UNKNOWN'}`,
            details: error.response?.data
          };
      }
    }

    return {
      message: `Unexpected error during ${context}`,
      code: 'UNKNOWN_ERROR',
      details: { error: String(error) }
    };
  }

  private static shouldRetry(error: AxiosError): boolean {
    const status = error.response?.status;
    return status === 500 || status === 503;
  }
} 