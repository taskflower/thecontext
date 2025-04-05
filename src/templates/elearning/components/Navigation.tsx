/**
 * E-Learning Navigation Component
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
    <div className={`bg-gray-50 p-5 border-t border-blue-100 ${className}`}>
      {/* Progress indicators */}
      <div className="flex justify-center mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`
              h-2.5 w-2.5 rounded-full mx-1
              ${
                index < currentStepIndex 
                  ? 'bg-blue-600' 
                  : index === currentStepIndex 
                    ? 'bg-blue-500 ring-2 ring-blue-200' 
                    : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-medium text-gray-500">
          <span className="text-blue-600 font-semibold">{currentStepIndex + 1}</span> of {totalSteps}
        </div>
        <div className="text-xs font-medium text-gray-500">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className={`px-4 py-2 flex items-center rounded ${
            isFirstStep 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
        
        {isLastStep ? (
          <button
            onClick={onFinish}
            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex items-center"
          >
            <span>Complete Lesson</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm flex items-center"
          >
            <span>Next Step</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigation;