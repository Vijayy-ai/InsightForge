import React, { useState, useEffect } from 'react';

interface MongoDBQueryBuilderProps {
  onChange: (query: string) => void;
}

export const MongoDBQueryBuilder: React.FC<MongoDBQueryBuilderProps> = ({ onChange }) => {
  const [queryType, setQueryType] = useState<'find' | 'aggregate'>('find');
  const [collection, setCollection] = useState('');
  const [filter, setFilter] = useState('{}');
  const [pipeline, setPipeline] = useState('[]');

  useEffect(() => {
    if (queryType === 'find') {
      const query = {
        collection,
        filter: JSON.parse(filter || '{}'),
      };
      onChange(JSON.stringify(query, null, 2));
    } else {
      try {
        const pipelineArray = JSON.parse(pipeline || '[]');
        if (collection) {
          pipelineArray.unshift({ $collection: collection });
        }
        onChange(JSON.stringify(pipelineArray, null, 2));
      } catch (e) {
        console.error('Invalid pipeline JSON:', e);
      }
    }
  }, [queryType, collection, filter, pipeline, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Query Type</label>
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value as 'find' | 'aggregate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          aria-label="Select query type"
        >
          <option value="find">Find Query</option>
          <option value="aggregate">Aggregation Pipeline</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Collection Name</label>
        <input
          type="text"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter collection name"
          aria-label="Collection name"
        />
      </div>

      {queryType === 'find' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Filter Query</label>
          <textarea
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={4}
            placeholder="{ field: value }"
            aria-label="Filter query"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Aggregation Pipeline</label>
          <textarea
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={4}
            placeholder="[{ $match: { field: value } }]"
            aria-label="Aggregation pipeline"
          />
        </div>
      )}
    </div>
  );
}; 