// src/templates/default/flowSteps/BasicStepTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useContextStore } from '@/lib/contextStore';

const BasicStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [userInput, setUserInput] = useState('');
  
  // Używamy useContextStore do przetwarzania szablonów
  const processTemplate = useContextStore(state => state.processTemplate);

  // Przetwarzamy wiadomość asystenta z kontekstem
  const processedMessage = node.assistantMessage ? processTemplate(node.assistantMessage) : '';

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    onSubmit(userInput);
    setUserInput('');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="whitespace-pre-line">{processedMessage}</p>
      </div>
      
      <div>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
          placeholder="Type your response..."
        ></textarea>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {isLastNode ? 'Finish' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default BasicStepTemplate;