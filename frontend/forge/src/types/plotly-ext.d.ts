import type { Layout, Data } from 'plotly.js';

export interface ExtendedPlotlyHTMLElement extends HTMLElement {
  data: Data[];
  layout: Partial<Layout>;
  el: HTMLElement & {
    layout: Partial<Layout>;
    data: Data[];
  };
}

export type Datum = string | number | Date | null;

export interface Config {
  responsive?: boolean;
  displayModeBar?: boolean;
  displaylogo?: boolean;
  modeBarButtonsToRemove?: string[];
  scrollZoom?: boolean;
  toImageButtonOptions?: {
    format?: string;
    filename?: string;
    height?: number;
    width?: number;
    scale?: number;
  };
} 