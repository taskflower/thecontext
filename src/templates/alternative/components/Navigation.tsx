/**
 * Alternative Navigation Component
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
  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
  
  return (
    <div className={`bg-gray-50 p-5 ${className}`}>
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Navigation controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-500">
          Step {currentStepIndex + 1} of {totalSteps}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className={`px-5 py-2 rounded-full border transition-all ${
              isFirstStep 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Previous
          </button>
          
          {isLastStep ? (
            <button
              onClick={onFinish}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;