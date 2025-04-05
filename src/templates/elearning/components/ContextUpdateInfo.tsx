/**
 * E-Learning Context Update Info Component
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
    <div className={`bg-blue-50 p-3 rounded-md border border-blue-200 mb-4 ${className}`}>
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-blue-700">Learning Progress Tracking</div>
          <div className="text-xs text-blue-600">
            Your answer will be stored in <span className="font-semibold">{contextKey}</span>
            {contextJsonPath && <span className="text-blue-500"> at {contextJsonPath}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextUpdateInfo;