import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface DataQuality {
  completeness: {
    score: number;
    missing_values: Record<string, number>;
    total_records: number;
  };
  accuracy: {
    score: number;
    invalid_values: Record<string, number>;
  };
  consistency: {
    score: number;
    inconsistencies: Record<string, string[]>;
  };
}

interface DataQualityDisplayProps {
  dataQuality: DataQuality;
}

export default function DataQualityDisplay({ dataQuality }: DataQualityDisplayProps): JSX.Element {
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatScore = (score: number): string => `${(score * 100).toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Data Quality Assessment</h2>
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3">Quality Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(dataQuality).map(([metric, data]) => (
              <div 
                key={metric} 
                className="bg-gray-50 p-4 rounded-lg"
                role="region"
                aria-label={`${metric} quality score`}
              >
                <h4 className="font-medium text-gray-700 capitalize">{metric}</h4>
                <div className="mt-2 flex items-center">
                  <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                    {formatScore(data.score)}
                  </span>
                  {data.score >= 0.8 ? (
                    <FiCheckCircle className="ml-2 text-green-500" />
                  ) : (
                    <FiAlertCircle className="ml-2 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 