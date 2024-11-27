declare module 'plotly.js-dist' {
  export * from 'plotly.js';
}

declare module 'react-plotly.js' {
  import { PlotParams } from 'plotly.js';
  const Plot: React.ComponentType<Partial<PlotParams>>;
  export { Plot };
  export type { PlotParams };
} 