import axios from 'axios';
import { EnhancedReport } from '@/types/report';
import { DatabaseConnectionParams, DatabaseResponse } from '@/types/database';
import { ProcessedData } from '@/types/common';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // File Upload
  async uploadFile(file: File): Promise<{ status: string; processed_data: ProcessedData }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<{ status: string; processed_data: ProcessedData }>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'File upload failed');
    }
  },

  // Report Generation
  async generateReport(
    data: Record<string, unknown>,
    query: string,
    format: 'json' | 'pdf' | 'html' = 'json'
  ): Promise<EnhancedReport | Blob> {
    try {
      const response = await api.post<EnhancedReport | Blob>(
        '/api/report/generate',
        {
          data,
          query,
          format
        },
        {
          responseType: format === 'pdf' ? 'blob' : 'json',
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        throw new Error(error.response.data.detail?.message || 'Report generation failed');
      }
      throw new Error(error instanceof Error ? error.message : 'Report generation failed');
    }
  },

  // Database Connection
  async connectDatabase(params: DatabaseConnectionParams): Promise<DatabaseResponse> {
    try {
      const response = await api.post<DatabaseResponse>('/api/database/connect', params);
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
        '/api/report/analyze',
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
        '/api/report/export',
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
        '/api/report/export',
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