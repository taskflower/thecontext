// src/templates/flowSteps/BasicStepTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from '../../lib/templateRegistry';  // Fix the import path

const BasicStepTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
}) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = () => {
    onSubmit(userInput);
    setUserInput('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Assistant</h2>
        <p className="text-gray-700">
          {node.assistantMessage || 'No assistant message'}
        </p>
      </div>

      <div className="space-y-2">
        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Your response..."
        />

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