
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLlmService } from '../lib/scenarioGeneratorLLM';
import { useAuth } from '@/hooks/useAuth';
import { Scenario } from '@/types';
import { createNewScenario } from '../lib/scenarioGenerator';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';


/**
 * Komponent do generowania nowych scenariuszy na podstawie istniejących
 */
const ScenarioGenerator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useWorkspaceStore();
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
  
  // Generuj nowy scenariusz na podstawie wybranego
  const handleGenerateScenario = async () => {
    if (!selectedScenario || !newScenarioName.trim()) {
      setErrorMessage('Wybierz scenariusz i wprowadź nazwę nowego scenariusza');
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage('');
    
    try {
      // Znajdź wybrany scenariusz z listy
      const templateScenarioFromStore = availableScenarios.find((s:Scenario) => s.id === selectedScenario);
      
      if (!templateScenarioFromStore) {
        throw new Error('Nie znaleziono wybranego scenariusza');
      }
      
      // Adapter konwertujący scenariusz ze store na format wymagany przez createNewScenario
      const templateScenario: Scenario = {
        id: templateScenarioFromStore.id,
        name: templateScenarioFromStore.name,
        description: templateScenarioFromStore.description,
        systemMessage: templateScenarioFromStore.systemMessage,
        getSteps: () => templateScenarioFromStore.nodes || [],
        nodes: []
      };
      
      // Połącz nazwę i opis, jeśli opis istnieje
      const fullDescription = newScenarioDescription.trim() 
        ? `${newScenarioName} - ${newScenarioDescription}`
        : newScenarioName;
      
      // Generuj nowy scenariusz
      const newScenarioImplementation = await createNewScenario(
        templateScenario,
        fullDescription,
        llmService
      );
      
      setGeneratedCode(newScenarioImplementation);
    } catch (error) {
      console.error("Błąd generowania scenariusza:", error);
      setErrorMessage(`Wystąpił błąd podczas generowania scenariusza: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Wróć do listy scenariuszy
  const handleBack = () => {
    navigate(currentWorkspace ? `/${currentWorkspace.id}` : '/');
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Generator Scenariuszy</h1>
      
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
        <>
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Krok 1: Wybierz scenariusz bazowy</h2>
            
            {availableScenarios.length === 0 ? (
              <p className="text-gray-500 italic">Brak dostępnych scenariuszy w workspace '{currentWorkspace.name}'</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Scenariusz bazowy:</label>
                  <select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Wybierz scenariusz...</option>
                    {availableScenarios.map((s:Scenario) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedScenario && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Szczegóły scenariusza bazowego:</h3>
                    {(() => {
                      const scenario = availableScenarios.find((s:Scenario) => s.id === selectedScenario);
                      return scenario ? (
                        <div>
                          <p><span className="font-medium">Nazwa:</span> {scenario.name}</p>
                          <p><span className="font-medium">Opis:</span> {scenario.description}</p>
                          <p><span className="font-medium">Liczba kroków:</span> {(scenario.nodes || []).length}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nazwa nowego scenariusza:</label>
              <input
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Nazwa dla nowego scenariusza..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Opis nowego scenariusza:</label>
              <textarea
                value={newScenarioDescription}
                onChange={(e) => setNewScenarioDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Wprowadź szczegółowy opis nowego scenariusza..."
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Wróć
              </button>
              
              <button
                onClick={handleGenerateScenario}
                disabled={isGenerating || !selectedScenario || !newScenarioName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                {isGenerating ? 'Generowanie...' : 'Wygeneruj scenariusz'}
              </button>
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                {errorMessage}
              </div>
            )}
          </div>
          
          {isGenerating && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Generowanie scenariusza...</h2>
              <p className="text-gray-600">
                To może potrwać kilka chwil. Trwa komunikacja z modelem AI i generowanie kodu scenariusza.
              </p>
            </div>
          )}
          
          {!isGenerating && generatedCode && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Wygenerowany kod scenariusza:</h2>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm">{generatedCode}</pre>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 mb-2">
                  Aby dodać ten scenariusz do aplikacji, skopiuj powyższy kod i umieść go w odpowiednim folderze scenariuszy.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('Kod został skopiowany do schowka!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Kopiuj do schowka
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScenarioGenerator;