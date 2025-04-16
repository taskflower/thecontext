// src/components/debug/DebugPanel.tsx
import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import FlowStepsList from "./FlowStepsList";
import StepDetails from "./StepDetails";
import ContextViewer from "./ContextViewer";
import { ContextValidator } from "./ContextValidator";
import { Bug, BugOff } from "lucide-react";

/**
 * Main debug panel component that manages state and coordinates
 * the display of different debugging sections.
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
    <div className="text-xs fixed bottom-4 right-4 z-50 flex flex-row items-end space-x-4 left-4 top-0">
      {/* Step details - additional window */}
      {isOpen && selectedStep !== null && (
        <StepDetails 
          step={flowSteps[selectedStep]} 
          onClose={() => setSelectedStep(null)} 
        />
      )}

      {/* Main debugger window */}
      {isOpen && (
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-4 mb-2 w-full max-h-[calc(100vh-100px)] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold"><Bug/></h3>
            {currentScenario && (
              <div className="bg-blue-100 px-2 py-1 rounded">
                {currentScenario.name || currentScenario.id}
              </div>
            )}
          </div>

          {/* Display validation issues if any */}
          {issues.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">Detected Issues:</h4>
              <ul className="list-disc pl-5 space-y-1 text-red-600">
                {issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Two-column layout for Steps and Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left column - Flow Steps */}
            <div>
              <h3 className="font-medium mb-2">Flow Steps</h3>
              <FlowStepsList 
                flowSteps={flowSteps} 
                selectedStep={selectedStep}
                onSelectStep={setSelectedStep}
              />
            </div>
            
            {/* Right column - Context Viewer */}
            <div>
              <ContextViewer />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSelectedStep(null);
          }
        }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md shadow-md flex items-center"
      >
        {isOpen ? <BugOff/> : <><Bug/> {issues.length > 0 ? `(${issues.length})` : ""}</>}
      </button>
    </div>
  );
};

export default DebugPanel;