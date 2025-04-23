// src/templates/default/flowSteps/BasicStepTemplate.tsx
import React, { useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";

const BasicStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const [userInput, setUserInput] = useState("");
  const processTemplate = useContextStore((state) => state.processTemplate);

  // Przetwarzamy wiadomość asystenta z kontekstem
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    onSubmit(userInput);
    setUserInput("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line text-blue-800">{processedMessage}</p>
        </div>
      )}
basic
      <div>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={4}
          placeholder="Wpisz swoją odpowiedź..."
        />
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Wstecz
        </button>

        <button
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className={`px-4 py-2 rounded ${
            userInput.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default BasicStepTemplate;