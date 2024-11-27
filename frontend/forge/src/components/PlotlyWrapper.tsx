import dynamic from 'next/dynamic';
import { PlotParams } from 'react-plotly.js';

// Dynamic import with no SSR to avoid plotly.js issues with Next.js
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div>Loading Plot...</div>
});

interface PlotlyWrapperProps extends Partial<PlotParams> {
  data: any[];
  layout?: Partial<Plotly.Layout>;
}

const PlotlyWrapper: React.FC<PlotlyWrapperProps> = ({ data, layout, ...rest }) => {
  return (
    <div className="w-full h-full">
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { l: 50, r: 50, t: 50, b: 50 },
          ...layout
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        {...rest}
      />
    </div>
  );
};

export default PlotlyWrapper; 