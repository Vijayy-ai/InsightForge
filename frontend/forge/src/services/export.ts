import { api } from './api';
import { ErrorHandlingService } from './error-handling';
import { ReportGenerationOptions } from '@/types/report';

export const exportService = {
  async exportReport(
    reportData: Record<string, unknown>,
    options: ReportGenerationOptions
  ): Promise<Blob | Record<string, unknown>> {
    try {
      const response = await api.post(
        '/api/export',
        { data: reportData, options },
        { responseType: options.format === 'json' ? 'json' : 'blob' }
      );
      return response.data;
    } catch (error) {
      const errorDetails = await ErrorHandlingService.handleError(
        error,
        'EXPORT_REPORT',
        async () => {
          return await exportService.exportReport(reportData, options);
        }
      );
      throw errorDetails;
    }
  },

  async exportVisualization(
    visualizationData: Record<string, unknown>,
    format: 'png' | 'svg' | 'pdf'
  ): Promise<Blob> {
    try {
      const response = await api.post(
        '/api/export/visualization',
        { data: visualizationData, format },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      const errorDetails = await ErrorHandlingService.handleError(
        error,
        'EXPORT_VISUALIZATION',
        async () => {
          return await exportService.exportVisualization(visualizationData, format);
        }
      );
      throw errorDetails;
    }
  },

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}; 