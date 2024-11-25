import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ExtendedPlotlyHTMLElement, Datum, Config } from '@/types/plotly-ext';
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
) as React.ComponentType<{
  data: Array<Partial<Data>>;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  useResizeHandler?: boolean;
  onInitialized?: () => void;
  onError?: (err: Error) => void;
  ref?: React.RefObject<ExtendedPlotlyHTMLElement>;
}>;

export default function PlotlyWrapper({
  data,
  layout = {},
  config = {},
  className = '',
  onError
}: PlotlyWrapperProps): JSX.Element {
  const plotRef = useRef<ExtendedPlotlyHTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const defaultLayout: Partial<Layout> = {
    autosize: true,
    height: 500,
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Inter, sans-serif'
    },
    xaxis: {
      ...layout.xaxis,
      title: layout.xaxis?.title || ''
    },
    yaxis: {
      ...layout.yaxis,
      title: layout.yaxis?.title || ''
    },
    hoverlabel: {
      bgcolor: '#FFF',
      font: { family: 'Inter, sans-serif' }
    }
  };

  const defaultConfig: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    scrollZoom: true,
    toImageButtonOptions: {
      format: 'png',
      filename: 'plot',
      height: 800,
      width: 1200,
      scale: 2
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (!plotRef.current) return;

    try {
      const plot = plotRef.current as ExtendedPlotlyHTMLElement;
      const xaxis = plot.layout.xaxis;

      if (!xaxis?.range) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          const delta = e.key === 'ArrowLeft' ? -0.1 : 0.1;
          const newRange: [Datum, Datum] = [
            xaxis.range[0] + delta,
            xaxis.range[1] + delta
          ];
          relayout(plot, { 'xaxis.range': newRange });
          break;
        }
        case '+':
        case '-': {
          const factor = e.key === '+' ? 0.9 : 1.1;
          const newRange: [Datum, Datum] = [
            xaxis.range[0] * factor,
            xaxis.range[1] * factor
          ];
          relayout(plot, { 'xaxis.range': newRange });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Error handling keyboard navigation:', err);
      if (onError && err instanceof Error) onError(err);
    }
  }, [onError]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-red-50 rounded-lg">
        <div className="text-red-600 text-center">
          <p className="font-medium">Failed to load visualization</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-[500px] relative ${className}`}
      role="figure"
      aria-label="Interactive data visualization"
      tabIndex={0}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <Loading />
        </div>
      )}
      <PlotComponent
        ref={plotRef}
        data={data}
        layout={{ ...defaultLayout, ...layout }}
        config={{ ...defaultConfig, ...config }}
        className="w-full h-full"
        useResizeHandler={true}
        onInitialized={(): void => {
          setIsLoading(false);
        }}
        onError={(err: Error): void => {
          setError(err.message);
          if (onError) onError(err);
        }}
      />
    </div>
  );
} 