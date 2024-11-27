import React from 'react';
import { ReportGenerationOptions } from '@/types/report';

interface ReportExportOptionsProps {
  options: ReportGenerationOptions;
  onChange: (options: ReportGenerationOptions) => void;
}

export default function ReportExportOptions({ options, onChange }: ReportExportOptionsProps) {
  const handleThemeChange = (value: string) => {
    onChange({
      ...options,
      customizations: {
        ...options.customizations,
        theme: value as 'light' | 'dark'
      }
    });
  };

  const handleFontSizeChange = (value: string) => {
    onChange({
      ...options,
      customizations: {
        ...options.customizations,
        fontSize: parseInt(value),
        theme: options.customizations?.theme || 'dark',
        colors: options.customizations?.colors || ['#1f77b4']
      }
    });
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...options,
      customizations: {
        ...options.customizations,
        theme: options.customizations?.theme || 'dark',
        fontSize: options.customizations?.fontSize || 12,
        colors: [color, ...(options.customizations?.colors || [])].slice(0, 5)
      }
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700" role="form">
      <h3 className="text-lg font-semibold text-gray-200">Export Options</h3>
      
      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-300">Format</label>
        <select
          id="format"
          value={options.format}
          onChange={(e) => onChange({ ...options, format: e.target.value as 'json' | 'pdf' | 'html' })}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="json">JSON</option>
          <option value="pdf">PDF</option>
          <option value="html">HTML</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Include Content</label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={options.includeVisualizations}
              onChange={(e) => onChange({ ...options, includeVisualizations: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-300">Visualizations</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={options.includeTables}
              onChange={(e) => onChange({ ...options, includeTables: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-300">Data Tables</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-300">Theme</label>
        <select
          id="theme"
          value={options.customizations?.theme || 'dark'}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div>
        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-300">Font Size</label>
        <input
          id="fontSize"
          type="number"
          min={8}
          max={24}
          value={options.customizations?.fontSize || 12}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Color Theme</label>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 