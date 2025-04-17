import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { getWidgetComponent } from '../lib/templates';

export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();
  
  // Jeśli brak workspace, przekieruj do strony głównej
  if (!currentWorkspace) {
    navigate('/');
    return null;
  }
  
  const { templateSettings, scenarios = [] } = currentWorkspace;
  
  // Pobierz komponent widgetu dla scenariusza
  const ScenarioWidget = getWidgetComponent(templateSettings.scenarioWidgetTemplate);
  
  // Obsługa wyboru scenariusza
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${currentWorkspace.id}/${scenarioId}`);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentWorkspace.name}</h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Powrót
          </button>
          <button
            onClick={() => navigate('/generator')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Generator scenariuszy
          </button>
        </div>
      </div>
      
      {currentWorkspace.description && (
        <p className="text-gray-600 mb-6">{currentWorkspace.description}</p>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Wybierz scenariusz:</h2>
      
      {ScenarioWidget ? (
        <ScenarioWidget
          data={scenarios}
          onSelect={handleSelectScenario}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario.id)}
              className="bg-white border border-gray-200 p-4 rounded shadow cursor-pointer hover:bg-gray-50"
            >
              <h2 className="font-semibold">{scenario.name}</h2>
              {scenario.description && (
                <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};