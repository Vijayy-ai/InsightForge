import type { Layout, PlotData } from 'plotly.js';

export type ChartType = 'scatter' | 'bar' | 'box' | 'line' | 'pie' | 'heatmap';

export interface PlotlyData extends Partial<PlotData> {
  name?: string;
  type?: ChartType;
  line?: {
    shape?: string;
    width?: number;
    [key: string]: unknown;
  };
}

export interface PlotlyLayout extends Partial<Layout> {
  template?: string;
  paper_bgcolor?: string;
  plot_bgcolor?: string;
} 