declare module 'plotly.js-dist-min' {
  import type { Layout, Data } from 'plotly.js';
  
  export * from 'plotly.js';
  
  export interface ExtendedPlotlyHTMLElement extends HTMLElement {
    data: Data[];
    layout: Partial<Layout>;
    el: HTMLElement & {
      layout: Partial<Layout>;
      data: Data[];
    };
  }

  export function relayout(
    graphDiv: ExtendedPlotlyHTMLElement,
    update: Partial<Layout>
  ): Promise<void>;
} 