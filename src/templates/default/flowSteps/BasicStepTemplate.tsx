// src/templates/default/flowSteps/BasicStepTemplate.tsx
import React, { useState } from "react";
import { FlowStepProps } from "template-registry-module";

// Rozszerzamy interfejs FlowStepProps lokalnie, aby obsługiwał Record<string, any>
interface ExtendedFlowStepProps extends Omit<FlowStepProps, 'contextItems'> {
  node: any;
  onSubmit: (value: string) => void;
  onPrevious: () => void;
  isLastNode: boolean;
  contextItems?: Record<string, any>;
}

const BasicStepTemplate: React.FC<ExtendedFlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  contextItems = {},
}) => {
  console.log("contextItems:", contextItems);
  const [userInput, setUserInput] = useState("");
  const [showContext, setShowContext] = useState(false);
  console.log("showContext:", showContext);
  console.log("setShowContext:", setShowContext);

  const handleSubmit = () => {
    onSubmit(userInput);
    setUserInput("");
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
          {node.assistantMessage || "No assistant message"}
        </p>
      </div>

      {/* Informacja o aktualizacji kontekstu */}
      {updatesContext && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center text-sm text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              Your answer will update <strong>{contextTarget}</strong> in the
              context
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
            {isLastNode ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicStepTemplate;