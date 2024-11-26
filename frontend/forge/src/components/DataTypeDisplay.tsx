import React, { useState } from 'react';
import { FiInfo, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

interface DataTypeDisplayProps {
  detectedType: 'time_series' | 'numerical' | 'categorical' | 'mixed';
  confidence: number;
  onTypeChange?: (newType: 'time_series' | 'numerical' | 'categorical' | 'mixed') => void;
}

export default function DataTypeDisplay({ 
  detectedType, 
  confidence, 
  onTypeChange 
}: DataTypeDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(detectedType);

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'time_series':
        return 'Data contains time-based measurements or observations';
      case 'numerical':
        return 'Data consists primarily of numerical values';
      case 'categorical':
        return 'Data contains categorical or discrete values';
      case 'mixed':
        return 'Data contains multiple types of values';
      default:
        return 'Unknown data type';
    }
  };

  const handleSave = () => {
    onTypeChange?.(selectedType);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Data Type Detection</h3>
        {!isEditing && onTypeChange && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit data type"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as typeof detectedType)}
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Select data type"
              title="Data type selection"
            >
              <option value="time_series">Time Series</option>
              <option value="numerical">Numerical</option>
              <option value="categorical">Categorical</option>
              <option value="mixed">Mixed</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiCheck className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={() => {
                  setSelectedType(detectedType);
                  setIsEditing(false);
                }}
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                <FiX className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Detected Type:</span>
              <span className="text-blue-600 capitalize">{detectedType.replace('_', ' ')}</span>
              <div className="ml-2 relative group">
                <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg">
                  {getTypeDescription(detectedType)}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{confidence}%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 