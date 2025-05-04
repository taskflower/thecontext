// src/_modules/scenarioGenerator/components/EnhancedScenarioGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLlmService } from '../lib/scenarioGeneratorLLM';

import { Scenario, FormField, NodeData } from '@/types';
import { createNewScenario } from '../lib/scenarioGenerator';
import { useAppStore, useAuth } from '@/hooks';
import { v4 as uuidv4 } from 'uuid';

// Typ dla etapów tworzenia scenariusza
type CreationStep = 'basic-info' | 'steps-definition' | 'step-details' | 'review';

// Typ dla etapów w scenariuszu
interface ScenarioStepDefinition {
  id: string;
  label: string;
  tplFile: string;
  assistantMessage?: string;
  contextPath?: string;
  order: number;
  attrs?: {
    schemaPath?: string;
    autoStart?: boolean;
    initialUserMessage?: string;
    widgets?: any[];
    [key: string]: any;
  };
}

/**
 * Ulepszony komponent do generowania nowych scenariuszy z możliwością 
 * szczegółowego definiowania kroków, kontekstu i schematów
 */
const EnhancedScenarioGenerator: React.FC = () => {
  // Stan dla całego procesu
  const [creationStep, setCreationStep] = useState<CreationStep>('basic-info');
  
  // Dane podstawowe scenariusza
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [scenarioIcon, setScenarioIcon] = useState('folder-kanban');
  
  // Dane kroków
  const [steps, setSteps] = useState<ScenarioStepDefinition[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  
  // Template i szablony kroków
  const [useTemplateScenario, setUseTemplateScenario] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Generowanie AI
  const [useAiGeneration, setUseAiGeneration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Stany dla UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Nawigacja i dane z store
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();
  const llmService = useLlmService();
  const { user } = useAuth();
  
  // Sprawdź, czy użytkownik jest zalogowany
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Pobierz dostępne scenariusze z obecnego workspace
  const availableScenarios = currentWorkspace?.scenarios || [];
  
  // Dostępne szablony kroków
  const stepTemplates = [
    { id: 'formStep', name: 'Formularz', description: 'Krok z formularzem do wprowadzania danych' },
    { id: 'llmStep', name: 'LLM', description: 'Krok wykorzystujący model językowy do analizy' },
    { id: 'widgetsStep', name: 'Widgety', description: 'Krok wyświetlający widgety z danymi' }
  ];
  
  // ===== Obsługa etapów tworzenia scenariusza =====
  
  // Przejście do następnego etapu
  const goToNextStep = () => {
    switch (creationStep) {
      case 'basic-info':
        setCreationStep('steps-definition');
        break;
      case 'steps-definition':
        if (steps.length === 0) {
          setError('Dodaj przynajmniej jeden krok do scenariusza');
          return;
        }
        setCreationStep('step-details');
        setCurrentStepIndex(0);
        break;
      case 'step-details':
        if (currentStepIndex !== null) {
          const nextIndex = currentStepIndex + 1;
          if (nextIndex < steps.length) {
            setCurrentStepIndex(nextIndex);
          } else {
            setCreationStep('review');
          }
        }
        break;
      case 'review':
        // Tutaj wywołanie generowania kodu
        generateScenarioCode();
        break;
    }
  };
  
  // Powrót do poprzedniego etapu
  const goToPreviousStep = () => {
    switch (creationStep) {
      case 'steps-definition':
        setCreationStep('basic-info');
        break;
      case 'step-details':
        if (currentStepIndex !== null && currentStepIndex > 0) {
          setCurrentStepIndex(currentStepIndex - 1);
        } else {
          setCreationStep('steps-definition');
        }
        break;
      case 'review':
        setCreationStep('step-details');
        setCurrentStepIndex(steps.length - 1);
        break;
    }
  };
  
  // ===== Obsługa kroków scenariusza =====
  
  // Dodanie nowego kroku
  const addStep = () => {
    const newStepId = `step-${uuidv4().substring(0, 8)}`;
    const newStep: ScenarioStepDefinition = {
      id: newStepId,
      label: `Krok ${steps.length + 1}`,
      tplFile: 'formStep',
      order: steps.length,
      contextPath: `${newStepId}-data`,
      attrs: {}
    };
    
    setSteps([...steps, newStep]);
  };
  
  // Usunięcie kroku
  const removeStep = (index: number) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);
    
    // Aktualizacja kolejności kroków
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      order: idx,
      label: `Krok ${idx + 1}: ${step.label.split(':').slice(1).join(':').trim()}`
    }));
    
    setSteps(reorderedSteps);
  };
  
  // Zmiana kolejności kroków
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    
    const updatedSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Zamiana miejscami
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[newIndex];
    updatedSteps[newIndex] = temp;
    
    // Aktualizacja kolejności i etykiet
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      order: idx,
      label: `Krok ${idx + 1}: ${step.label.split(':').slice(1).join(':').trim() || 'Bez nazwy'}`
    }));
    
    setSteps(reorderedSteps);
  };
  
  // Aktualizacja szczegółów kroku
  const updateCurrentStep = (updates: Partial<ScenarioStepDefinition>) => {
    if (currentStepIndex === null) return;
    
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      ...updates
    };
    
    setSteps(updatedSteps);
  };
  
  // Dodanie schematu formularza do kroku
  const addSchemaToStep = (fields: FormField[]) => {
    if (currentStepIndex === null) return;
    
    const currentStep = steps[currentStepIndex];
    const schemaPath = `schemas.${currentStep.id}`;
    
    // Aktualizacja kroku z nową ścieżką schematu
    updateCurrentStep({
      attrs: {
        ...currentStep.attrs,
        schemaPath
      }
    });
    
    // W rzeczywistej aplikacji, należy także zapisać schemat w kontekście workspace
    console.log(`Dodano schemat dla kroku ${currentStep.id}:`, fields);
  };
  
  // ===== Generowanie scenariusza =====
  
  // Wczytanie szablonu scenariusza
  const loadTemplateScenario = () => {
    if (!selectedTemplateId) return;
    
    const templateScenario = availableScenarios.find((s: Scenario) => s.id === selectedTemplateId);
    if (!templateScenario) return;
    
    // Konwersja kroków z szablonu
    const templateSteps = (templateScenario.nodes || []).map((node: NodeData, idx: number) => ({
      id: `step-${uuidv4().substring(0, 8)}`,
      label: node.label || `Krok ${idx + 1}`,
      tplFile: node.tplFile || 'formStep',
      assistantMessage: node.assistantMessage,
      contextPath: `step-data-${idx}`,
      order: idx,
      attrs: node.attrs || {}
    }));
    
    setSteps(templateSteps);
    setScenarioName(`Nowy ${templateScenario.name}`);
    setScenarioDescription(templateScenario.description || '');
  };
  
  // Generowanie kodu scenariusza
  const generateScenarioCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Przygotowanie scenariusza do generowania kodu
      const scenarioId = scenarioName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      
      // Przekształcenie kroków na format NodeData
      const nodes: NodeData[] = steps.map((step) => ({
        id: step.id,
        label: step.label,
        tplFile: step.tplFile,
        assistantMessage: step.assistantMessage,
        contextPath: step.contextPath,
        order: step.order,
        attrs: step.attrs,
        scenarioId: scenarioId
      }));
      
      // Stworzenie scenariusza
      const scenario: Scenario = {
        id: scenarioId,
        name: scenarioName,
        description: scenarioDescription,
        nodes,
        icon: scenarioIcon,
        getSteps: () => nodes
      };
      
      if (useAiGeneration && aiPrompt.trim()) {
        // Generowanie scenariusza za pomocą AI
        const templateScenario = availableScenarios.find((s: Scenario) => s.id === selectedTemplateId);
        if (templateScenario) {
          const generatedImplementation = await createNewScenario(
            templateScenario,
            aiPrompt,
            llmService
          );
          setGeneratedCode(generatedImplementation);
        } else {
          throw new Error('Nie wybrano szablonu scenariusza dla generowania AI');
        }
      } else {
        // Generowanie kodu scenariusza bez AI
        const scenarioCode = generateScenarioImplementation(scenario);
        setGeneratedCode(scenarioCode);
      }
    } catch (error) {
      console.error("Błąd generowania scenariusza:", error);
      setError(`Wystąpił błąd podczas generowania scenariusza: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funkcja generująca kod implementacji scenariusza
  const generateScenarioImplementation = (scenario: Scenario): string => {
    const nodes = scenario.nodes || [];
    
    // Generowanie importów
    const imports = `
// src/scenarios/${scenario.id}/index.ts
import { Scenario, NodeData } from '@/types';
`;

    // Generowanie definicji węzłów
    const nodesDefinitions = nodes.map((node) => `
export const ${node.id}: NodeData = {
  id: "${node.id}",
  label: "${node.label}",
  tplFile: "${node.tplFile}",
  ${node.assistantMessage ? `assistantMessage: "${node.assistantMessage}",` : ''}
  ${node.contextPath ? `contextPath: "${node.contextPath}",` : ''}
  order: ${node.order},
  scenarioId: "${scenario.id}",
  attrs: ${JSON.stringify(node.attrs || {}, null, 2)}
};`).join('\n');

    // Generowanie definicji scenariusza
    const scenarioDefinition = `
export const ${scenario.id}Scenario: Scenario = {
  id: "${scenario.id}",
  name: "${scenario.name}",
  description: "${scenario.description}",
  icon: "${scenario.icon}",
  nodes: [
    ${nodes.map(node => node.id).join(',\n    ')}
  ]
};

export default ${scenario.id}Scenario;
`;

    return imports + nodesDefinitions + scenarioDefinition;
  };
  
  // ===== Renderowanie komponentów dla etapów =====
  
  // Renderowanie etapu podstawowych informacji
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Krok 1: Podstawowe informacje o scenariuszu</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Nazwa scenariusza:</label>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Podaj nazwę scenariusza..."
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Opis scenariusza:</label>
          <textarea
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Opisz przeznaczenie scenariusza..."
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Ikona:</label>
          <select
            value={scenarioIcon}
            onChange={(e) => setScenarioIcon(e.target.value)}
            className="w-full p-2 border rounded-md"
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
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="useTemplate"
              checked={useTemplateScenario}
              onChange={() => setUseTemplateScenario(!useTemplateScenario)}
              className="mr-2"
            />
            <label htmlFor="useTemplate" className="font-medium">
              Użyj istniejącego scenariusza jako szablonu
            </label>
          </div>
          
          {useTemplateScenario && (
            <div className="mt-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Wybierz scenariusz...</option>
                {availableScenarios.map((s: Scenario) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              
              <button
                onClick={loadTemplateScenario}
                disabled={!selectedTemplateId}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                Wczytaj szablon
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="useAI"
              checked={useAiGeneration}
              onChange={() => setUseAiGeneration(!useAiGeneration)}
              className="mr-2"
            />
            <label htmlFor="useAI" className="font-medium">
              Generuj scenariusz przy pomocy AI
            </label>
          </div>
          
          {useAiGeneration && (
            <div className="mt-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Opisz szczegółowo, jaki scenariusz chcesz wygenerować..."
              />
              
              <div className="mt-2 text-sm text-gray-600">
                <p>Przy generowaniu AI potrzebny jest również szablon bazowy. Zaznacz opcję powyżej i wybierz szablon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Renderowanie etapu definiowania kroków
  const renderStepsDefinitionStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Krok 2: Definiowanie kroków scenariusza</h2>
      
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={addStep}
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Dodaj krok
          </button>
        </div>
        
        {steps.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700">Brak kroków. Dodaj przynajmniej jeden krok do scenariusza.</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center border-b last:border-b-0 p-4 bg-white hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{step.label}</div>
                  <div className="text-sm text-gray-500">Typ: {step.tplFile}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Renderowanie etapu szczegółów kroku
  const renderStepDetailsStep = () => {
    if (currentStepIndex === null || !steps[currentStepIndex]) {
      return <div>Błąd: Nie wybrano kroku</div>;
    }
    
    const currentStep = steps[currentStepIndex];
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Krok 3: Szczegóły kroku ({currentStepIndex + 1}/{steps.length})
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Nazwa kroku:</label>
            <input
              type="text"
              value={currentStep.label.split(':').slice(1).join(':').trim()}
              onChange={(e) => updateCurrentStep({
                label: `Krok ${currentStepIndex + 1}: ${e.target.value}`
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Nazwa kroku..."
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Typ kroku:</label>
            <select
              value={currentStep.tplFile}
              onChange={(e) => updateCurrentStep({ tplFile: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              {stepTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Ścieżka kontekstu:</label>
            <input
              type="text"
              value={currentStep.contextPath || ''}
              onChange={(e) => updateCurrentStep({ contextPath: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Ścieżka do zapisania danych z kroku..."
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Wiadomość asystenta:</label>
            <textarea
              value={currentStep.assistantMessage || ''}
              onChange={(e) => updateCurrentStep({ assistantMessage: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder="Wiadomość wyświetlana użytkownikowi..."
            />
          </div>
          
          {/* Różne opcje w zależności od typu kroku */}
          {currentStep.tplFile === 'formStep' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Schemat formularza</h3>
              
              {/* Tu możemy dodać edytor schematu formularza */}
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  W rzeczywistej implementacji, tutaj będzie edytor pól formularza.
                </p>
                <button
                  onClick={() => addSchemaToStep([
                    { name: 'field1', label: 'Pole 1', type: 'text', required: true },
                    { name: 'field2', label: 'Pole 2', type: 'number' }
                  ])}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md"
                >
                  Dodaj przykładowy schemat
                </button>
              </div>
            </div>
          )}
          
          {currentStep.tplFile === 'llmStep' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Konfiguracja zapytania LLM</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoStart"
                    checked={currentStep.attrs?.autoStart || false}
                    onChange={(e) => updateCurrentStep({
                      attrs: { ...currentStep.attrs, autoStart: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="autoStart">Automatyczne uruchomienie</label>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Początkowa wiadomość:</label>
                  <textarea
                    value={currentStep.attrs?.initialUserMessage || ''}
                    onChange={(e) => updateCurrentStep({
                      attrs: { ...currentStep.attrs, initialUserMessage: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Wiadomość wysyłana do modelu językowego..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Możesz używać zmiennych w postaci {`{{`}zmienna{`}}`} do referencji kontekstu.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {currentStep.tplFile === 'widgetsStep' && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Konfiguracja widgetów</h3>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  W rzeczywistej implementacji, tutaj będzie edytor konfiguracji widgetów.
                </p>
                <button
                  onClick={() => updateCurrentStep({
                    attrs: {
                      ...currentStep.attrs,
                      widgets: [
                        { tplFile: 'info', title: 'Informacja', dataPath: 'result.info' },
                        { tplFile: 'stats', title: 'Statystyki', dataPath: 'result.stats' }
                      ]
                    }
                  })}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md"
                >
                  Dodaj przykładowe widgety
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Renderowanie etapu przeglądu
  const renderReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Krok 4: Przegląd i generowanie scenariusza</h2>
      
      <div className="p-4 bg-white border rounded-md">
        <h3 className="font-medium text-lg mb-3">Podsumowanie scenariusza</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nazwa:</p>
              <p>{scenarioName}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Ikona:</p>
              <p>{scenarioIcon}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Liczba kroków:</p>
              <p>{steps.length}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Opis:</p>
            <p>{scenarioDescription}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">Kroki:</h4>
            
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <div className="font-medium">{step.label}</div>
                    <div className="text-sm text-gray-500">Typ: {step.tplFile}</div>
                  </div>
                  
                  <div className="mt-1 text-sm">
                    {step.contextPath && (
                      <div><span className="text-gray-600">Kontekst:</span> {step.contextPath}</div>
                    )}
                    
                    {step.assistantMessage && (
                      <div><span className="text-gray-600">Wiadomość:</span> {step.assistantMessage}</div>
                    )}
                    
                    {step.tplFile === 'formStep' && step.attrs?.schemaPath && (
                      <div><span className="text-gray-600">Schemat:</span> {step.attrs.schemaPath}</div>
                    )}
                    
                    {step.tplFile === 'llmStep' && step.attrs?.initialUserMessage && (
                      <div><span className="text-gray-600">Zapytanie LLM:</span> {step.attrs.initialUserMessage}</div>
                    )}
                    
                    {step.tplFile === 'widgetsStep' && step.attrs?.widgets && (
                      <div><span className="text-gray-600">Widgety:</span> {step.attrs.widgets.length}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {useAiGeneration && (
        <div className="p-4 bg-gray-50 border rounded-md">
          <h3 className="font-medium text-lg mb-2">Generowanie AI</h3>
          <p className="text-gray-700">Scenariusz zostanie wygenerowany na podstawie:</p>
          <p className="italic mt-1 p-2 bg-white rounded border">{aiPrompt}</p>
        </div>
      )}
      
      <div className="text-right">
        <button
          onClick={generateScenarioCode}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Wygeneruj kod scenariusza
        </button>
      </div>
    </div>
  );
  
  // ===== Główny render =====
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Kreator Scenariuszy</h1>
      
      {!currentWorkspace ? (
        <div className="bg-amber-100 p-4 rounded-lg mb-4">
          <p className="text-amber-800">Wybierz najpierw workspace, aby móc generować scenariusze.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Przejdź do workspaces
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pasek postępu */}
          <div className="relative pt-1">
            <div className="flex flex-col md:flex-row items-center justify-between md:mb-1">
              <div className="w-full flex justify-between mb-2 md:mb-0">
                {['Informacje', 'Kroki', 'Szczegóły', 'Przegląd'].map((stepName, idx) => {
                  const steps = ['basic-info', 'steps-definition', 'step-details', 'review'];
                  const isActive = creationStep === steps[idx];
                  const isPast = steps.indexOf(creationStep) > idx;
                  
                  return (
                    <div key={idx} className={`text-xs md:text-sm font-medium ${
                      isActive ? 'text-blue-600' : isPast ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {stepName}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 transition-all duration-300"
                style={{ 
                  width: creationStep === 'basic-info' ? '25%' : 
                         creationStep === 'steps-definition' ? '50%' : 
                         creationStep === 'step-details' ? '75%' : '100%' 
                }}
              ></div>
            </div>
          </div>
          
          {/* Zawartość bieżącego etapu */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {creationStep === 'basic-info' && renderBasicInfoStep()}
            {creationStep === 'steps-definition' && renderStepsDefinitionStep()}
            {creationStep === 'step-details' && renderStepDetailsStep()}
            {creationStep === 'review' && renderReviewStep()}
            
            {/* Błędy */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            {/* Przyciski nawigacji */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={creationStep === 'basic-info' ? () => navigate('/') : goToPreviousStep}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {creationStep === 'basic-info' ? 'Anuluj' : 'Wstecz'}
              </button>
              
              <button
                onClick={goToNextStep}
                disabled={
                  (creationStep === 'basic-info' && !scenarioName) ||
                  (creationStep === 'steps-definition' && steps.length === 0) ||
                  isLoading
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? 'Proszę czekać...' : 
                 creationStep === 'review' ? 'Wygeneruj' : 'Dalej'}
              </button>
            </div>
          </div>
          
          {/* Wygenerowany kod */}
          {generatedCode && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Wygenerowany kod scenariusza</h2>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
                <pre className="text-sm">{generatedCode}</pre>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Skopiuj ten kod i zapisz go w odpowiednich plikach swojej aplikacji.
                </p>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('Kod został skopiowany do schowka!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Kopiuj do schowka
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedScenarioGenerator;