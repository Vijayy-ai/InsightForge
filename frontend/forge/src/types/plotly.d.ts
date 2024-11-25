import type { Layout, Data } from 'plotly.js';

declare module 'plotly.js-dist-min' {
  export * from 'plotly.js';
  
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

  export function relayout(
    graphDiv: ExtendedPlotlyHTMLElement,
    update: Partial<Layout>
  ): Promise<void>;
}

declare module 'react-plotly.js' {
  import type { Data, Layout, Config } from 'plotly.js-dist-min';
  import type { RefObject } from 'react';
  import type { ExtendedPlotlyHTMLElement } from '@/types/plotly-ext';
  
  export interface PlotParams {
    data: Array<Partial<Data>>;
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: () => void;
    onError?: (err: Error) => void;
    ref?: RefObject<ExtendedPlotlyHTMLElement>;
  }

  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
} 