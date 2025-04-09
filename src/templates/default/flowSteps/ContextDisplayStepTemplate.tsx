// src/templates/default/flowSteps/ContextDisplayStepTemplate.tsx
import React from 'react';
import { FlowStepProps } from 'template-registry-module';
import { ContextItem } from '@/../raw_modules/revertcontext-nodes-module/src';

interface ExtendedFlowStepProps extends FlowStepProps {
  contextItems?: ContextItem[] | Record<string, any>;
}

const ContextDisplayStepTemplate: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  console.log("ContextDisplayStepTemplate contextItems type:", typeof contextItems, contextItems);
  const handleContinue = () => {
    // Przekazujemy pustą wartość, bo nie aktualizujemy kontekstu
    onSubmit("");
  };

  // Format context data for display
  const getFormattedContextData = () => {
    // If contextItems is an array of ContextItem objects
    if (Array.isArray(contextItems)) {
      return contextItems.map((item) => ({
        id: item.id,
        title: item.title || item.id,
        contentType: item.contentType || 'text/plain',
        content: formatContextData(item),
        updatedAt: item.updatedAt
      }));
    } 
    // If contextItems is an object (Record<string, any>)
    else {
      return Object.entries(contextItems).map(([key, value]) => ({
        id: key,
        title: key,
        contentType: typeof value === 'object' ? 'application/json' : 'text/plain',
        content: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
        updatedAt: null
      }));
    }
  };

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

  const formattedItems = getFormattedContextData();

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">
          {node.label || "Context Summary"}
        </h2>
        <p className="text-gray-700 mb-4">
          {node.assistantMessage || "Here's a summary of the collected information."}
        </p>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Collected Context Data
        </h3>
        
        <div className="space-y-4">
          {formattedItems.length === 0 ? (
            <p className="text-gray-500 italic">No context data was collected during this flow.</p>
          ) : (
            formattedItems.map((item) => (
              <div key={item.id} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-700">{item.title}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {item.contentType}
                  </span>
                </div>
                <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto">
                  {item.content}
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

      {/* Opcjonalnie: Dodaj przycisk do zrzutu kontekstu do pliku */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <button 
          onClick={() => {
            const data = JSON.stringify(contextItems, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'context-data.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download Context Data</span>
        </button>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        {!isLastNode && (
          <button 
            onClick={handleContinue}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Continue
          </button>
        )}
        {isLastNode && (
          <button 
            onClick={handleContinue}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextDisplayStepTemplate;