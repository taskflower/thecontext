/**
 * Default Navigation Component
 */
import React from 'react';
import { NavigationProps } from '../../types';

const Navigation: React.FC<NavigationProps> = ({ 
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onFinish,
  isFirstStep,
  isLastStep,
  className = ''
}) => {
  return (
    <div className={`flex justify-between items-center p-4 bg-gray-100 border-t border-gray-200 ${className}`}>
      <div className="text-sm text-gray-600">
        Step {currentStepIndex + 1} of {totalSteps}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className={`px-4 py-2 border rounded-md ${
            isFirstStep 
              ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        
        {isLastStep ? (
          <button
            onClick={onFinish}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigation;