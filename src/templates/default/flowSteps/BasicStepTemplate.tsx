// src/templates/default/flowSteps/BasicStepTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module'; 
import { ContextItem } from '@/../raw_modules/revertcontext-nodes-module/src';

interface ExtendedFlowStepProps extends FlowStepProps {
  contextItems?: ContextItem[];
}

const BasicStepTemplate: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  const [userInput, setUserInput] = useState('');
  const [showContext, setShowContext] = useState(false);

  const handleSubmit = () => {
    onSubmit(userInput);
    setUserInput('');
  };

  // Sprawdza, czy węzeł aktualizuje kontekst
  const updatesContext = !!node.contextKey;
  
  // Jeśli węzeł ma contextKey i contextJsonPath, wyświetl której części kontekstu dotyczy
  const getContextTarget = () => {
    if (node.contextKey && node.contextJsonPath) {
      return `${node.contextKey}.${node.contextJsonPath}`;
    } else if (node.contextKey) {
      return node.contextKey;
    }
    return null;
  };

  const contextTarget = getContextTarget();

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Assistant</h2>
        <p className="text-gray-700">
          {node.assistantMessage || 'No assistant message'}
        </p>
      </div>

      {/* Informacja o aktualizacji kontekstu */}
      {updatesContext && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center text-sm text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              Your answer will update <strong>{contextTarget}</strong> in the context
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Your response..."
        />

        {/* Toggle do wyświetlania/ukrywania kontekstu */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => setShowContext(!showContext)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showContext ? (
                <path d="M18 15l-6-6-6 6" />
              ) : (
                <path d="M6 9l6 6 6-6" />
              )}
            </svg>
            <span>{showContext ? 'Hide Context' : 'Show Context'}</span>
          </button>
        </div>

        {/* Wyświetlanie kontekstu */}
        {showContext && contextItems.length > 0 && (
          <div className="bg-gray-100 p-3 rounded-lg mt-2 text-sm">
            <h3 className="font-medium mb-2 text-gray-700">Current Context:</h3>
            <div className="space-y-2">
              {contextItems.map((item) => (
                <div key={item.id} className="bg-white p-2 rounded border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.title || item.id}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.contentType}</span>
                  </div>
                  <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                    {item.contentType === 'application/json' 
                      ? JSON.stringify(JSON.parse(item.content), null, 2)
                      : item.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button 
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isLastNode ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicStepTemplate;