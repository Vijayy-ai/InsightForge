import { ProcessedData } from '@/types/common';
import { VisualizationResponse } from '@/types/report';

export const isProcessedData = (data: unknown): data is ProcessedData => {
  const pd = data as ProcessedData;
  return (
    pd !== null &&
    typeof pd === 'object' &&
    typeof pd.type === 'string' &&
    Array.isArray(pd.data)
  );
};

export const isVisualizationResponse = (data: unknown): data is VisualizationResponse => {
  const vr = data as VisualizationResponse;
  return (
    vr !== null &&
    typeof vr === 'object' &&
    typeof vr.type === 'string' &&
    Array.isArray(vr.data) &&
    typeof vr.layout === 'object'
  );
}; 