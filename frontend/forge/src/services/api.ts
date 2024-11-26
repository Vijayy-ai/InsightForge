import axios from 'axios';
import { EnhancedReport } from '@/types/report';
import { DatabaseConnectionParams, DatabaseResponse } from '@/types/database';
import { ProcessedData } from '@/types/common';
import { ErrorHandlingService } from './error-handling';
import { DataProcessingOptions, ReportGenerationOptions } from '@/types/report';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const apiService = {
  // File Upload
  async uploadFile(file: File): Promise<{ status: string; processed_data: ProcessedData }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<{ status: string; processed_data: ProcessedData }>(
        '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        throw new Error(error.response.data?.detail || 'File upload failed');
      }
      throw new Error('File upload failed');
    }
  },

  // Report Generation
  async generateReport(
    data: Record<string, unknown>,
    query: string,
    format: 'json' | 'pdf' | 'html' = 'json',
    options?: DataProcessingOptions
  ): Promise<EnhancedReport | Blob> {
    try {
      const response = await api.post<EnhancedReport | Blob>(
        '/report/generate',
        {
          data,
          query,
          format,
          options
        },
        { 
          responseType: format === 'json' ? 'json' : 'blob',
          headers: {
            'Content-Type': 'application/json',
            'Accept': format === 'json' 
              ? 'application/json' 
              : format === 'pdf' 
                ? 'application/pdf' 
                : 'text/html'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Report generation error:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        throw new Error(error.response.data?.detail || 'Failed to generate report');
      }
      throw error;
    }
  },

  // Database Connection
  async connectDatabase(params: DatabaseConnectionParams): Promise<DatabaseResponse> {
    try {
      const response = await api.post<DatabaseResponse>('/database/connect', params);
      return response.data;
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(error instanceof Error ? error.message : 'Database connection failed');
    }
  },

  // Data Analysis
  async analyzeData(data: ProcessedData): Promise<EnhancedReport> {
    try {
      const response = await api.post<EnhancedReport>(
        '/report/analyze',
        { data }
      );
      return response.data;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Analysis failed');
    }
  },

  // Report Export
  async exportReport(
    data: Record<string, unknown>,
    format: string,
    template: string = 'default'
  ): Promise<Blob> {
    try {
      const response = await api.post<Blob>(
        '/report/export',
        { data, format, template },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(error instanceof Error ? error.message : 'Export failed');
    }
  },

  // Add exportData method
  async exportData(data: string, format: string): Promise<Blob> {
    try {
      const response = await api.post<Blob>(
        '/report/export',
        { data, format },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(error instanceof Error ? error.message : 'Export failed');
    }
  }
}; 