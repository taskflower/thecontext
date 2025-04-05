/**
 * Default Context Update Info Component
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
    <div className={`text-xs bg-blue-50 p-2 rounded-md text-blue-600 mb-4 ${className}`}>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Context Variable: <strong>{contextKey}</strong>
          {contextJsonPath && ` / Path: ${contextJsonPath}`}
        </span>
      </div>
    </div>
  );
};

export default ContextUpdateInfo;