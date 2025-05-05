// src/templates/scenario-builder/flowSteps/scenarioPickerStep.tsx
import React, { useState } from "react";
import { FlowStepProps } from "@/types";
import { useFlow, useAppStore } from "@/hooks";
import { SubjectIcon } from "@/components/SubjectIcon";

const ScenarioPickerStep: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  const {
    processedAssistantMessage,
    isLoading,
    error,
    handleBack,
    handleNext,

  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  // Stan lokalny
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Pobieranie scenariuszy z app store
  const { getCurrentWorkspace } = useAppStore();
  const workspace = getCurrentWorkspace();
  const availableScenarios = workspace?.scenarios || [];

  // Filtrowanie scenariuszy
  const filteredScenarios = availableScenarios.filter(scenario => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      scenario.name.toLowerCase().includes(searchLower) ||
      (scenario.description || "").toLowerCase().includes(searchLower)
    );
  });

  // Obsługa wyboru scenariusza
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    
    // Zapisz wybrany scenariusz do kontekstu, jeśli zdefiniowano ścieżkę
    if (node?.contextPath) {
      const selectedScenario = availableScenarios.find(s => s.id === scenarioId);
      updateContextPath(node.contextPath, { 
        scenarioId, 
        scenarioName: selectedScenario?.name || "",
        scenarioDescription: selectedScenario?.description || "" 
      });
    }
  };

  // Obsługa kontynuacji do następnego kroku
  const handleContinue = () => {
    if (!selectedScenarioId) return;
    
    const selectedScenario = availableScenarios.find(s => s.id === selectedScenarioId);
    handleNext({ 
      scenarioId: selectedScenarioId,
      scenarioName: selectedScenario?.name || "",
      scenarioDescription: selectedScenario?.description || "" 
    });
  };

  return (
    <div className="space-y-6">
      {/* Komunikat asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Pole wyszukiwania */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Szukaj scenariusza..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Lista scenariuszy */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-900">
          Wybierz scenariusz do edycji
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchTerm ? "Brak scenariuszy spełniających kryteria wyszukiwania." : "Brak dostępnych scenariuszy."}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedScenarioId === scenario.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleSelectScenario(scenario.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-700">
                    <SubjectIcon iconName={scenario.icon} size={20} />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{scenario.name}</h4>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">
                          {scenario.nodes?.length || 0} kroków
                        </span>
                        {selectedScenarioId === scenario.id && (
                          <div className="ml-2 flex-shrink-0 h-5 w-5 text-blue-600">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {scenario.description && (
                      <p className="mt-1 text-xs text-gray-500">{scenario.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleBack}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          {isFirstNode ? "Anuluj" : "Wstecz"}
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedScenarioId}
          className={`px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow ${
            selectedScenarioId
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default ScenarioPickerStep;