import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ExtendedPlotlyHTMLElement, Config } from 'plotly.js';
import type { Layout, Data } from 'plotly.js';
import Loading from './Loading';
import { relayout } from 'plotly.js-dist-min';

// Define strict types for props
interface PlotlyWrapperProps {
  data: Array<Partial<Data>>;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  onError?: (error: Error) => void;
}

const defaultLayout: Partial<Layout> = {
  autosize: true,
  margin: { l: 50, r: 50, t: 50, b: 50 },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: {
    family: 'Inter, sans-serif'
  }
};

const defaultConfig: Partial<Config> = {
  responsive: true,
  displayModeBar: false,
  displaylogo: false
};

// Use dynamic import with proper typing
const PlotComponent = dynamic(
  () => import('react-plotly.js'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-gray-50">
        <Loading />
      </div>
    ),
  }
) as React.ComponentType<PlotlyWrapperProps>;

export default function PlotlyWrapper({
  data,
  layout = {},
  config = {},
  className = '',
  onError
}: PlotlyWrapperProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const plotRef = useRef<ExtendedPlotlyHTMLElement | null>(null);

  useEffect(() => {
    if (plotRef.current) {
      relayout(plotRef.current, { ...defaultLayout, ...layout })
        .catch((err) => {
          console.error('Error updating layout:', err);
          if (onError) onError(err);
        });
    }
  }, [layout, onError]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load visualization</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-[500px] relative ${className}`}
      role="figure"
      aria-label="Interactive data visualization"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <Loading />
        </div>
      )}
      <PlotComponent
        data={data}
        layout={{ ...defaultLayout, ...layout }}
        config={{ ...defaultConfig, ...config }}
        className="w-full h-full"
        onInitialized={() => setIsLoading(false)}
        onError={(err: Error) => {
          setError(err.message);
          if (onError) onError(err);
        }}
      />
    </div>
  );
} 