import React from 'react';
import type { GroundingChunk } from '../types';

interface SourcesProps {
  sources: GroundingChunk[];
}

export const Sources: React.FC<SourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Fontes:</h4>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {source.web.title || source.web.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
