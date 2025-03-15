// components/ui/StepModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { GraphNode } from '@/modules/modules';

interface StepModalProps {
  steps: GraphNode[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const StepModal: React.FC<StepModalProps> = ({ 
  steps, currentStep, onNext, onPrev, onClose 
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="font-medium mb-2">Node: {steps[currentStep].label}</div>
          <div className="text-sm mb-2">Value: {steps[currentStep].value}</div>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`px-3 py-1 rounded-md text-sm ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={onNext}
              className="px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="px-3 py-1 rounded-md text-sm bg-green-500 text-white hover:bg-green-600"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);