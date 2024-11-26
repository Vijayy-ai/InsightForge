import { AxiosError } from 'axios';

export class ErrorHandlingService {
  static async handleError(
    error: unknown,
    context: string,
    retryCallback?: () => Promise<any>
  ): Promise<Error> {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      // Handle specific error cases
      switch (status) {
        case 400:
          return new Error(`Invalid request: ${detail || 'Bad request'}`);
        case 422:
          return new Error(`Data validation failed: ${detail || 'Invalid data'}`);
        case 500:
          if (retryCallback && this.shouldRetry(error)) {
            try {
              return await retryCallback();
            } catch (retryError) {
              return new Error(`Server error after retry: ${detail || 'Internal server error'}`);
            }
          }
          return new Error(`Server error: ${detail || 'Internal server error'}`);
        default:
          return new Error(`${context} failed: ${detail || error.message}`);
      }
    }

    return new Error(`Unexpected error during ${context}`);
  }

  private static shouldRetry(error: AxiosError): boolean {
    const status = error.response?.status;
    return status === 500 || status === 503;
  }
} 