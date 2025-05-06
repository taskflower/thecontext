// src/templates/scenario-builder/flowSteps/stepsEditorStep.tsx
import React, { useState, useEffect } from "react";
import { FlowStepProps } from "@/types";
import { useFlow } from "@/hooks";

interface StepData {
  id?: string;
  label: string;
  type: string;
  description?: string;
  contextPath?: string;
  [key: string]: any;
}

const StepsEditorStep: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  const {
    isLoading,
    error,
    processedAssistantMessage,
    handleBack,
    handleNext
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  // Stan lokalny dla edycji kroków
  const [steps, setSteps] = useState<StepData[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [newStep, setNewStep] = useState<StepData | null>(null);

  // Pobierz kroki z kontekstu - używając node.attrs?.dataPath
  useEffect(() => {
    const loadStepsData = async () => {
      if (!node?.attrs?.dataPath) return;
      
      try {
        // Sprawdź, czy mamy dane w atrybutach węzła
        if (node.attrs.data) {
          console.log("Loading steps from node.attrs.data");
          const stepsData = node.attrs.data;
          if (Array.isArray(stepsData)) {
            const stepsWithIds = stepsData.map((step, index) => ({
              ...step,
              id: step.id || `step-${Date.now()}-${index}`
            }));
            setSteps(stepsWithIds);
          }
        } 
        // Jeśli nie mamy bezpośrednich danych, próbujemy znaleźć je w kontekście
        else if (window && window.appContext && typeof window.appContext.getContextPath === 'function') {
          console.log("Loading steps from global appContext");
          const stepsFromContext = window.appContext.getContextPath(node.attrs.dataPath);
          if (stepsFromContext && Array.isArray(stepsFromContext)) {
            const stepsWithIds = stepsFromContext.map((step, index) => ({
              ...step,
              id: step.id || `step-${Date.now()}-${index}`
            }));
            setSteps(stepsWithIds);
          }
        }
        // Użyj przykładowych danych, jeśli nic innego nie zadziała
        else {
          console.log("Using example steps data");
          // Przykładowe dane dla trybu development
          const exampleSteps = [
            {
              id: "step-1",
              label: "Krok 1: Formularz",
              type: "FormStep",
              description: "Zbieranie danych od użytkownika",
              contextPath: "step-1-data"
            },
            {
              id: "step-2",
              label: "Krok 2: Analiza",
              type: "LlmStep",
              description: "Analiza zebranych danych",
              contextPath: "step-2-data"
            }
          ];
          setSteps(exampleSteps);
          console.warn("getContextPath is not available. Using example data for development.");
        }
      } catch (err) {
        console.error("Error loading steps data:", err);
      }
    };

    loadStepsData();
  }, [node?.attrs?.dataPath]);

  // Zapisz kroki do kontekstu przy każdej zmianie
  useEffect(() => {
    if (node?.contextPath && steps.length > 0) {
      try {
        if (window && window.appContext && typeof window.appContext.updateContextPath === 'function') {
          window.appContext.updateContextPath(node.contextPath, steps);
        } else {
          console.warn("updateContextPath is not available. Changes will not be saved to context.");
        }
      } catch (err) {
        console.error("Error saving steps to context:", err);
      }
    }
  }, [steps, node?.contextPath]);

  // Obsługa dodawania nowego kroku
  const handleAddStep = () => {
    setNewStep({
      id: `step-${Date.now()}`,
      label: `Krok ${steps.length + 1}`,
      type: 'formStep',
      description: '',
      contextPath: `step-${steps.length + 1}-data`
    });
    setEditingStepIndex(null); // Zamknij edytor istniejącego kroku, jeśli otwarty
  };

  // Obsługa zapisywania nowego kroku
  const handleSaveNewStep = () => {
    if (newStep) {
      setSteps([...steps, newStep]);
      setNewStep(null);
    }
  };

  // Obsługa anulowania dodawania nowego kroku
  const handleCancelNewStep = () => {
    setNewStep(null);
  };

  // Obsługa edycji kroku
  const handleEditStep = (index: number) => {
    setEditingStepIndex(index);
    setNewStep(null); // Zamknij formularz nowego kroku, jeśli otwarty
  };

  // Obsługa zapisywania zmian w kroku
  const handleUpdateStep = (index: number, updatedStep: StepData) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = updatedStep;
    setSteps(updatedSteps);
    setEditingStepIndex(null);
  };

  // Obsługa usuwania kroku
  const handleDeleteStep = (index: number) => {
    const shouldDelete = window.confirm('Czy na pewno chcesz usunąć ten krok?');
    if (shouldDelete) {
      const updatedSteps = steps.filter((_, i) => i !== index);
      setSteps(updatedSteps);
      setEditingStepIndex(null);
    }
  };

  // Obsługa zmiany kolejności kroków
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return; // Nie można przesunąć poza zakres
    }

    const updatedSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];

    // Zaktualizuj etykiety, aby odzwierciedlały nową kolejność
    updatedSteps.forEach((step, i) => {
      step.label = step.label.replace(/^Krok \d+:/, `Krok ${i + 1}:`);
    });

    setSteps(updatedSteps);
    
    // Zaktualizuj indeks edytowanego kroku, jeśli jest aktywny
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
  };

  // Formularz edycji kroku
  const StepForm = ({ step, onSave, onCancel }: { step: StepData, onSave: (step: StepData) => void, onCancel: () => void }) => {
    const [editedStep, setEditedStep] = useState<StepData>({ ...step });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditedStep({ ...editedStep, [name]: value });
    };

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {step.id ? 'Edytuj krok' : 'Dodaj nowy krok'}
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa kroku
          </label>
          <input
            type="text"
            name="label"
            value={editedStep.label}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typ kroku
          </label>
          <select
            name="type"
            value={editedStep.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="FormStep">Formularz</option>
            <option value="LlmStep">Analiza AI</option>
            <option value="WidgetsStep">Widżety</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis
          </label>
          <textarea
            name="description"
            value={editedStep.description || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ścieżka kontekstu
          </label>
          <input
            type="text"
            name="contextPath"
            value={editedStep.contextPath || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={() => onSave(editedStep)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Zapisz
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Komunikat asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Wskaźnik ładowania */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Błąd */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          <p className="font-medium">Wystąpił błąd</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Lista kroków */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">Kroki scenariusza</h3>
          <button
            onClick={handleAddStep}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Dodaj krok
          </button>
        </div>

        {/* Lista istniejących kroków */}
        <div className="divide-y divide-gray-200">
          {steps.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Brak kroków. Dodaj pierwszy krok, aby rozpocząć.
            </div>
          ) : (
            steps.map((step, index) => (
              <div 
                key={step.id || index}
                className={`p-4 ${editingStepIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                {editingStepIndex === index ? (
                  <StepForm 
                    step={step}
                    onSave={(updatedStep) => handleUpdateStep(index, updatedStep)}
                    onCancel={() => setEditingStepIndex(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{step.label}</h4>
                      {step.description && (
                        <p className="mt-1 text-xs text-gray-500">{step.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {step.type.replace('Step', '')}
                        </span>
                        {step.contextPath && (
                          <span className="text-xs text-gray-500">
                            Dane: <code className="bg-gray-100 px-1 py-0.5 rounded">{step.contextPath}</code>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveStep(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-200 ${
                          index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'
                        }`}
                        title="Przesuń wyżej"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleMoveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        className={`p-1 rounded hover:bg-gray-200 ${
                          index === steps.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'
                        }`}
                        title="Przesuń niżej"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleEditStep(index)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-500"
                        title="Edytuj krok"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStep(index)}
                        className="p-1 rounded hover:bg-gray-200 text-red-500"
                        title="Usuń krok"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formularz nowego kroku */}
      {newStep && (
        <div className="mt-4">
          <StepForm 
            step={newStep}
            onSave={handleSaveNewStep}
            onCancel={handleCancelNewStep}
          />
        </div>
      )}

      {/* Przyciski nawigacji */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleBack}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>

        <button
          onClick={() => handleNext(steps)}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow bg-gray-900 text-white hover:bg-gray-800"
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default StepsEditorStep;