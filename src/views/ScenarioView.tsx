// src/views/ScenarioView.tsx - Improved Version
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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        <div className="space-y-2 mb-6 md:mb-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{currentWorkspace.name}</h1>
          {currentWorkspace.description && (
            <p className="text-slate-500 text-lg max-w-2xl">{currentWorkspace.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Powrót
          </button>
         
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 text-slate-900">Wybierz scenariusz:</h2>
        
        {ScenarioWidget ? (
          <ScenarioWidget
            data={scenarios}
            onSelect={handleSelectScenario}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-slate-300"
              >
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{scenario.name}</h3>
                {scenario.description && (
                  <p className="text-slate-500 text-base leading-relaxed">{scenario.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};