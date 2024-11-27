import React from 'react';
import type { DataProcessingOptions } from '@/types/report';

interface Props {
  options: DataProcessingOptions;
  onChange: (options: DataProcessingOptions) => void;
}

export function DataProcessingOptions({ options, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.cleanMissingValues}
            onChange={(e) => onChange({ ...options, cleanMissingValues: e.target.checked })}
          />
          <span>Clean Missing Values</span>
        </label>
      </div>
      {/* Add other options */}
    </div>
  );
} 