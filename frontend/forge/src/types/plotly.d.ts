import type { Data, Layout, Config } from 'plotly.js';

declare module 'react-plotly.js' {
  import React from 'react';

  interface PlotParams {
    data: Array<Partial<Data>>;
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    frames?: Array<Partial<Data>>;
    useResizeHandler?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: Figure) => void;
    onUpdate?: (figure: Figure) => void;
    onPurge?: () => void;
    onError?: (err: Error) => void;
  }

  interface Figure {
    data: Array<Partial<Data>>;
    layout: Partial<Layout>;
  }

  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
} 