/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface StepModalProps<T> {
  steps: T[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  renderStepContent?: (step: T) => React.ReactNode;
}

export const StepModal = <T extends Record<string, any>>({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
  renderStepContent,
}: StepModalProps<T>) => {
  const step = steps[currentStep];
  // Force re-render on step change
  React.useEffect(() => {}, [steps, currentStep]);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{step.label || `Step ${currentStep + 1}`}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {renderStepContent ? (
            renderStepContent(step)
          ) : (
            <div>
              <p>{step.label || `Step ${currentStep + 1}`}</p>
              {step.assistant && (
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  {step.assistant}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded ${
              isFirstStep ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            Previous
          </button>
          
          {isLastStep ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              Finish
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};