// src/templates/default/flowSteps/FlowSummaryTemplate.tsx
import React from 'react';
import { FlowStepProps } from 'template-registry-module';
import { ContextItem } from '@/../raw_modules/context-manager-module/src/types/ContextTypes';

interface ExtendedFlowStepProps extends FlowStepProps {
  contextItems?: ContextItem[];
  onRestart?: () => void;
}

const FlowSummaryTemplate: React.FC<ExtendedFlowStepProps> = ({ 
  onPrevious, 
  contextItems = [],
  onRestart
}) => {
  const formatContextData = (item: ContextItem) => {
    try {
      if (item.contentType === 'application/json') {
        const parsed = JSON.parse(item.content);
        return JSON.stringify(parsed, null, 2);
      }
      return item.content;
    } catch (e) {
      return item.content;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-green-800">Flow Completed Successfully!</h2>
            <p className="text-green-700">Your conversation flow has been completed. Here's a summary of the collected information.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Collected Context Data</h3>
        
        <div className="space-y-4">
          {contextItems.length === 0 ? (
            <p className="text-gray-500 italic">No context data was collected during this flow.</p>
          ) : (
            contextItems.map((item) => (
              <div key={item.id} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-700">{item.title || item.id}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {item.contentType || 'text/plain'}
                  </span>
                </div>
                <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto">
                  {formatContextData(item)}
                </pre>
                {item.updatedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(item.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back
        </button>
        {onRestart && (
          <button 
            onClick={onRestart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Restart Flow
          </button>
        )}
      </div>
    </div>
  );
};

export default FlowSummaryTemplate;