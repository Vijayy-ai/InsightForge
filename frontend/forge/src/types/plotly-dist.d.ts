declare module 'plotly.js-dist-min' {
  import type { Layout, Data, Config } from 'plotly.js';
  
  export interface ExtendedPlotlyHTMLElement extends HTMLElement {
    data: Data[];
    layout: Partial<Layout>;
    config: Partial<Config>;
    on: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback: (data: any) => void) => void;
  }

  export function relayout(
    graphDiv: ExtendedPlotlyHTMLElement | null,
    update: Partial<Layout>
  ): Promise<void>;

  export function newPlot(
    graphDiv: ExtendedPlotlyHTMLElement | null,
    data: Data[],
    layout?: Partial<Layout>,
    config?: Partial<Config>
  ): Promise<void>;

  export * from 'plotly.js';
} 