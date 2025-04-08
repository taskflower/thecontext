// src/templates/newyork/flowSteps/StandardInputStep.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';

const StandardInputStep: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      onSubmit(userInput);
      setUserInput('');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 flex items-center space-x-1">
        <div className="h-1 w-6 bg-black rounded"></div>
        <div className="h-1 w-12 bg-gray-200 rounded"></div>
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
      </div>
      
      {/* Assistant message card */}
      <div className="mb-8 border border-gray-100 bg-white rounded-lg shadow-sm">
        <div className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-black text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-3.08c.58-.21 1-.76 1-1.42V12.5c0-.66-.42-1.21-1-1.42z"></path>
                <path d="M14 3v5h5"></path>
              </svg>
            </div>
            <h2 className="text-lg font-medium">Assistant</h2>
          </div>
          
          <div className="prose">
            <p className="text-gray-800">
              {node.assistantMessage || 'Please provide your input below.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* User input section */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Your response</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full min-h-32 p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent rounded-md resize-none transition-all"
          placeholder="Type your response here..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSubmit();
            }
          }}
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          Press Ctrl+Enter to submit
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !userInput.trim()}
          className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            isLastNode ? 'Complete' : 'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default StandardInputStep;