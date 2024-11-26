export interface DataQuality {
  completeness: {
    score: number;
    missing_values: Record<string, number>;
    total_records: number;
  };
  accuracy: {
    score: number;
    invalid_values: Record<string, number>;
  };
  consistency: {
    score: number;
    inconsistencies: Record<string, string[]>;
  };
}

export interface Statistics {
  mean: number;
  median: number;
  std: number;
  min?: number;
  max?: number;
  quartiles?: [number, number, number];
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  confidence: number;
  components?: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
} 