// src/templates/scenario-builder/widgets/StepsOverview.tsx
import React from "react";

interface StepData {
  id?: string;
  label: string;
  type: string;
  description?: string;
  contextPath?: string;
  [key: string]: any;
}

interface StepsOverviewProps {
  title?: string;
  description?: string;
  data?: StepData[] | { steps?: StepData[] };
  onSelect?: (id: string) => void;
}

const StepsOverview: React.FC<StepsOverviewProps> = ({
  title,
  description,
  data = [],
  onSelect
}) => {
  // Obsługa różnych formatów danych
  let steps: StepData[] = [];
  
  if (Array.isArray(data)) {
    steps = data;
  } else if (data && typeof data === 'object' && Array.isArray(data.steps)) {
    steps = data.steps;
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'formStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      case 'llmStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      case 'widgetsStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'stepsEditorStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        );
      case 'scenarioPickerStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'scenarioEditorStep':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      default:
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const handleSelect = (index: number) => {
    if (onSelect && steps[index]) {
      onSelect(steps[index].id || `step-${index}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          {title || "Kroki scenariusza"}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {steps.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Brak zdefiniowanych kroków
          </div>
        ) : (
          steps.map((step, index) => (
            <div 
              key={step.id || `step-${index}`}
              className="flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleSelect(index)}
            >
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-700">
                {getStepIcon(step.type)}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{step.label}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {step.type.replace('Step', '')}
                  </span>
                </div>
                
                {step.description && (
                  <p className="mt-1 text-xs text-gray-500">{step.description}</p>
                )}
                
                {step.contextPath && (
                  <p className="mt-2 text-xs text-gray-400">
                    Dane: <code className="bg-gray-100 px-1 py-0.5 rounded">{step.contextPath}</code>
                  </p>
                )}
              </div>
              
              <div className="ml-2 flex-shrink-0">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-800">
                  {index + 1}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Przycisk dodawania kroku */}
      {steps.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => onSelect && onSelect('add-step')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Dodaj krok
          </button>
        </div>
      )}
      
      {/* Przyciski akcji na dole widgetu */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={() => onSelect && onSelect('reorder-steps')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1.5" 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
          Zmień kolejność
        </button>
        
        <button
          onClick={() => onSelect && onSelect('edit-all-steps')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edytuj wszystkie
        </button>
      </div>
    </div>
  );
};

export default StepsOverview;