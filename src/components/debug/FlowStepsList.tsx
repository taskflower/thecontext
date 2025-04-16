// src/components/debug/FlowStepsList.tsx
import React from "react";
import { getStepDescription, getTypeLabel, getStepIcon } from "./helpers";

interface FlowStepsListProps {
  flowSteps: any[];
  selectedStep: number | null;
  onSelectStep: (index: number) => void;
}

/**
 * Komponent wyświetlający listę kroków przepływu w formie pionowej osi czasu
 */
const FlowStepsList: React.FC<FlowStepsListProps> = ({
  flowSteps,
  selectedStep,
  onSelectStep,
}) => {
  if (flowSteps.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Brak kroków w tym szablonie
      </div>
    );
  }

  return (
    <div className="relative">
      {flowSteps.map((step, index) => {
        const isActive = selectedStep === index;
        const stepType = step.type || "default";
        const icon = getStepIcon(stepType);
        
        // Sprawdza czy krok może mieć problemy z brakiem danych
        const missingContextData = checkForMissingContextData(step);

        return (
          <React.Fragment key={index}>
            <div
              className={`
                border ${
                  isActive
                    ? "border-blue-400 bg-blue-50"
                    : missingContextData
                    ? "border-yellow-400 bg-yellow-50" 
                    : "border-gray-200 bg-white"
                } 
                rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-50
              `}
              onClick={() => onSelectStep(index)}
            >
              <div className="flex items-center mb-1">
                <div className="text-xl mr-2">{icon}</div>
                <div className="font-medium">
                  {step.label || `Krok ${index + 1}`}
                </div>
                <div className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {getTypeLabel(stepType)}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                {getStepDescription(step)}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Ścieżka:{" "}
                <code className="bg-gray-100 px-1 rounded font-mono">
                  {step.contextPath || "brak"}
                </code>
              </div>
              
              {/* Wyświetla ostrzeżenie jeśli wykryto brakujące dane kontekstowe */}
              {missingContextData && (
                <div className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-1 rounded">
                  <span className="font-bold">⚠️ Uwaga:</span> {missingContextData}
                </div>
              )}
            </div>

            {index < flowSteps.length - 1 && (
              <div className="flex justify-center items-center h-6 mb-2">
                <div className="w-0.5 h-full bg-gray-300"></div>
                <div className="absolute bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="transform rotate-90">→</span>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Sprawdza czy krok może mieć problemy z brakami danych kontekstowych
 * @param step Krok do sprawdzenia
 * @returns Wiadomość z opisem problemu lub null jeśli nie znaleziono problemów
 */
function checkForMissingContextData(step: any): string | null {
  // Sprawdź auto-startujące kroki LLM, które mogą wymagać danych od użytkownika
  if (step.templateId === "llm-query" && step.attrs?.autoStart === true) {
    // Sprawdź czy wiadomość użytkownika zawiera zmienne które mogą być nieokreślone
    const initialMessage = step.attrs?.initialUserMessage || '';
    const templateVars = initialMessage.match(/\{\{([^}]+)\}\}/g) || [];
    
    if (templateVars.length > 0) {
      return `Krok może wymagać zmiennych: ${templateVars.join(', ')}`;
    }
  }
  
  return null;
}

export default FlowStepsList;