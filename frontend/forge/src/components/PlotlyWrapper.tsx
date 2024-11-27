import dynamic from 'next/dynamic';
import type { Data, Layout, Config } from 'plotly.js';

// Dynamic import with no SSR to avoid plotly.js issues with Next.js
const Plot = dynamic(() => import('react-plotly.js').then(mod => {
  const Plot = mod.default;
  return Plot as React.ComponentType<PlotParams>;
}), {
  ssr: false,
  loading: () => <div>Loading Plot...</div>
});

interface PlotParams {
  data: Array<Partial<Data>>;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  useResizeHandler?: boolean;
  style?: React.CSSProperties;
}

interface PlotlyWrapperProps {
  data: Array<Partial<Data>>;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

const PlotlyWrapper: React.FC<PlotlyWrapperProps> = ({ data, layout, config }) => {
  return (
    <div className="w-full h-full">
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { l: 50, r: 50, t: 50, b: 50 },
          ...layout
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          ...config
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PlotlyWrapper; 