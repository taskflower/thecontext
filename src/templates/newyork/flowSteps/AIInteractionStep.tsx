// src/templates/newyork/flowSteps/AIInteractionStep.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';

const AIInteractionStep: React.FC<FlowStepProps> = ({ 
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
    // Simulate AI processing time
    setTimeout(() => {
      onSubmit(userInput);
      setUserInput('');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 flex items-center space-x-1">
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
        <div className="h-1 w-12 bg-black rounded"></div>
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
      </div>
      
      {/* AI Assistant message */}
      <div className="mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4M12 8h.01"></path>
              </svg>
            </div>
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-black">AI Assistant</span>
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-black text-white">GPT</span>
            </div>
            <div className="prose">
              <p className="text-gray-800">
                {node.assistantMessage || 'How can I assist you today?'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User input */}
      <div className="mb-6 relative">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full min-h-32 p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          placeholder="Type your message..."
          disabled={isLoading}
        ></textarea>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !userInput.trim()}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
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
          {isLoading ? 'Processing...' : (isLastNode ? 'Finish' : 'Continue')}
        </button>
      </div>
    </div>
  );
};

export default AIInteractionStep;