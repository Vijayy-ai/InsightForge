import { AxiosError } from 'axios';

export class CustomAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CustomAPIError';
  }
}

export const handleAPIError = (error: unknown): CustomAPIError => {
  if (error instanceof AxiosError && error.response) {
    return new CustomAPIError(
      error.response.data.detail || 'An error occurred',
      error.response.status
    );
  }
  return new CustomAPIError(error instanceof Error ? error.message : 'Network error');
}; 