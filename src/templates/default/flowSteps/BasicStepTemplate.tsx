// src/templates/default/flowSteps/BasicStepTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useContextStore } from '../../../lib/contextStore';

const BasicStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const [userInput, setUserInput] = useState('');
  
  // Pobieramy funkcje do przetwarzania szablonów i aktualizacji kontekstu z Zustand
  const processTemplate = useContextStore(state => state.processTemplate);
  const updateContext = useContextStore(state => state.updateContext);
  
  // Przetwarzamy wiadomość asystenta z zmiennymi kontekstowymi
  const assistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';
  
  // Obsługa zatwierdzenia
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aktualizuj kontekst jeśli podano klucz kontekstu
    if (node.contextKey) {
      updateContext(node.contextKey, userInput, node.contextJsonPath);
    }
    
    // Wywołaj callback do przejścia dalej
    onSubmit(userInput);
  };
  
  return (
    <div className="space-y-4">
      {/* Wiadomość asystenta */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="whitespace-pre-line">{assistantMessage}</p>
      </div>
      
      {/* Formularz odpowiedzi */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Twoja odpowiedź..."
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="flex justify-between">
          {/* Przycisk powrotu */}
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Wstecz
          </button>
          
          {/* Przycisk zatwierdzenia */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {isLastNode ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicStepTemplate;