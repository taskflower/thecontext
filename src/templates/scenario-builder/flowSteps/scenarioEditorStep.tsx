// src/templates/scenario-builder/flowSteps/scenarioEditorStep.tsx
import React, { useState, useEffect } from "react";
import { FlowStepProps } from "@/types";
import { useFlow } from "@/hooks";
import { SubjectIcon } from "@/components/SubjectIcon";

interface ScenarioData {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  systemMessage?: string;
  steps?: Array<{
    id: string;
    label: string;
    type: string;
    description?: string;
    contextPath?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

const ScenarioEditorStep: React.FC<FlowStepProps> = ({
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
    getContextPath,
    updateContextPath,
    handleBack,
    handleNext
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  // Stan lokalny
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'steps' | 'advanced'>('basic');
  const [hasChanges, setHasChanges] = useState(false);

  // Pobierz dane scenariusza z kontekstu
  useEffect(() => {
    if (node?.attrs?.dataPath) {
      const scenarioFromContext = getContextPath(node.attrs.dataPath);
      if (scenarioFromContext && typeof scenarioFromContext === 'object') {
        setScenario(scenarioFromContext);
      }
    }
  }, [node?.attrs?.dataPath, getContextPath]);

  // Zapisz scenariusz do kontekstu przy każdej zmianie
  useEffect(() => {
    if (node?.contextPath && scenario && hasChanges) {
      updateContextPath(node.contextPath, scenario);
    }
  }, [scenario, hasChanges, node?.contextPath, updateContextPath]);

  // Obsługa aktualizacji podstawowych informacji
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (scenario) {
      setScenario({
        ...scenario,
        [name]: value
      });
      setHasChanges(true);
    }
  };

  // Obsługa aktualizacji zaawansowanych ustawień
  const handleAdvancedSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (scenario) {
      setScenario({
        ...scenario,
        [name]: value
      });
      setHasChanges(true);
    }
  };

  // Obsługa zakończenia edycji
  const handleFinishEditing = () => {
    if (scenario) {
      handleNext(scenario);
    }
  };

  // Nawigacja po zakładkach
  const TabButton = ({ tab, label }: { tab: 'basic' | 'steps' | 'advanced'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium border-b-2 ${
        activeTab === tab
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  // Jeśli nie ma scenariusza, pokaż komunikat o ładowaniu lub błędzie
  if (!scenario) {
    return (
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700">Nie udało się załadować scenariusza do edycji.</p>
            <div className="mt-4 flex">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              >
                Wróć
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Komunikat asystenta */}
      {processedAssistantMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Błąd */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          <p className="font-medium">Wystąpił błąd</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Nagłówek z informacjami o scenariuszu */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 flex items-start">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-blue-100 text-blue-700">
            <SubjectIcon iconName={scenario.icon} size={24} />
          </div>
          
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-medium text-gray-900">
              Edycja scenariusza: {scenario.name}
            </h2>
            {scenario.description && (
              <p className="mt-1 text-sm text-gray-500">{scenario.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{scenario.id}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Zakładki nawigacyjne */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <TabButton tab="basic" label="Podstawowe informacje" />
          <TabButton tab="steps" label="Kroki scenariusza" />
          <TabButton tab="advanced" label="Zaawansowane" />
        </nav>
      </div>

      {/* Panel podstawowych informacji */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa scenariusza
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={scenario.name}
                onChange={handleBasicInfoChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                id="description"
                name="description"
                value={scenario.description || ''}
                onChange={handleBasicInfoChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                Ikona
              </label>
              <select
                id="icon"
                name="icon"
                value={scenario.icon || 'folder-kanban'}
                onChange={handleBasicInfoChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="folder-kanban">Folder</option>
                <option value="calculator">Kalkulator</option>
                <option value="bar-chart">Wykres</option>
                <option value="clipboard-list">Lista</option>
                <option value="presentation">Prezentacja</option>
                <option value="file-check">Dokument</option>
                <option value="users">Użytkownicy</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Panel kroków scenariusza */}
      {activeTab === 'steps' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">
              Kroki scenariusza ({scenario.steps?.length || 0})
            </h3>
            <span className="text-xs text-gray-500">
              Aby edytować kroki, przejdź do zaawansowanego edytora kroków
            </span>
          </div>
          
          <div className="divide-y divide-gray-200">
            {!scenario.steps || scenario.steps.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Brak zdefiniowanych kroków w tym scenariuszu.
              </div>
            ) : (
              scenario.steps.map((step, index) => (
                <div key={step.id} className="p-4 hover:bg-gray-50">
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
                    
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs text-gray-800 font-medium">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Panel zaawansowanych ustawień */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="systemMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Komunikat systemowy dla LLM
              </label>
              <textarea
                id="systemMessage"
                name="systemMessage"
                value={scenario.systemMessage || ''}
                onChange={handleAdvancedSettingsChange}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Wpisz komunikat systemowy dla modelu LLM używanego w scenariuszu..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Ten komunikat będzie używany jako instrukcja systemowa dla wszystkich kroków LLM w tym scenariuszu.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Identyfikator scenariusza</h3>
              <div className="bg-gray-50 p-2 rounded-md">
                <code className="text-sm">{scenario.id}</code>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Identyfikator scenariusza jest używany do referencji w kodzie i nie może być zmieniony.
              </p>
            </div>
          </div>
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
          onClick={handleFinishEditing}
          disabled={!hasChanges}
          className={`px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow ${
            hasChanges
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

export default ScenarioEditorStep;