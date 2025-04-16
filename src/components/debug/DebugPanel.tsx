// src/components/debug/DebugPanel.tsx
import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import FlowStepsList from "./FlowStepsList";
import StepDetails from "./StepDetails";
import { ContextValidator } from "./ContextValidator";

/**
 * Główny komponent panelu debugowania, który zarządza stanem i koordynuje
 * wyświetlanie różnych sekcji informacji debugowania.
 */
const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const { getCurrentScenario } = useAppStore();
  const currentScenario = getCurrentScenario();

  // Get flow steps from current scenario
  const flowSteps = currentScenario?.nodes || [];

  // Check for common issues with the current scenario
  const issues = ContextValidator.validateScenario(currentScenario, flowSteps);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-row items-end space-x-4">
      {/* Szczegóły kroku - dodatkowe okno */}
      {isOpen && selectedStep !== null && (
        <StepDetails 
          step={flowSteps[selectedStep]} 
          onClose={() => setSelectedStep(null)} 
        />
      )}

      {/* Główne okno debugera */}
      {isOpen && (
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-4 mb-2 w-[400px] max-h-[calc(100vh-100px)] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Debuger szablonu</h3>
            {currentScenario && (
              <div className="text-sm bg-blue-100 px-2 py-1 rounded">
                {currentScenario.name || currentScenario.id}
              </div>
            )}
          </div>

          {/* Display validation issues if any */}
          {issues.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">Wykryte problemy:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-600">
                {issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Flow steps visualization */}
          <FlowStepsList 
            flowSteps={flowSteps} 
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
          />
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSelectedStep(null);
          }
        }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md shadow-md text-sm flex items-center"
      >
        {isOpen ? "Zamknij debuger" : `Debuger szablonu ${issues.length > 0 ? `(${issues.length})` : ""}`}
      </button>
    </div>
  );
};

export default DebugPanel;