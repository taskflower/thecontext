/**
 * Alternative Context Update Info Component
 */
import React from 'react';
import { ContextUpdateProps } from '../../types';

const ContextUpdateInfo: React.FC<ContextUpdateProps> = ({
  contextKey,
  contextJsonPath,
  className = ''
}) => {
  if (!contextKey) return null;
  
  return (
    <div className={`text-xs bg-indigo-50 p-3 rounded-lg text-indigo-700 mb-4 border border-indigo-100 ${className}`}>
      <div className="flex items-center">
        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <span>
          Saving input to <strong className="font-semibold text-indigo-800">{contextKey}</strong>
          {contextJsonPath && (
            <span className="text-indigo-600"> at path <code className="px-1 py-0.5 bg-indigo-100 rounded">{contextJsonPath}</code></span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ContextUpdateInfo;