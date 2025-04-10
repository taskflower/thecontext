// src/views/ScenarioView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { getLayoutComponent, getWidgetComponent } from '../lib/templates';

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  
  // Pobierz dane workspace'a
  const { workspaces, selectWorkspace } = useAppStore();
  
  // Ustawienie aktywnego workspace'a i inicjalizacja kontekstu
  useEffect(() => {
    if (workspaceId) {
      console.log("[ScenarioView] Inicjalizacja workspace:", workspaceId);
      
      // Ustaw aktywny workspace w store aplikacji (teraz również inicjalizuje kontekst)
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);
  
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  
  // Obsługa powrotu
  const handleBack = () => navigate('/');
  
  // Obsługa wyboru scenariusza
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${workspaceId}/${scenarioId}`);
  };
  
  // Jeśli nie ma workspace'a
  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Workspace nie znaleziony</h2>
          <p className="text-gray-600 mb-4">
            Nie można znaleźć workspace o ID: <span className="font-mono">{workspaceId}</span>
          </p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Powrót do listy workspace'ów
          </button>
        </div>
      </div>
    );
  }
  
  // Pobierz layout
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings.layoutTemplate
  );
  
  if (!LayoutComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Layout nie znaleziony</h2>
          <p className="text-gray-600 mb-4">
            Nie można znaleźć layoutu: <span className="font-mono">{currentWorkspace.templateSettings.layoutTemplate}</span>
          </p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Powrót do listy workspace'ów
          </button>
        </div>
      </div>
    );
  }
  
  // Pobierz widget scenariuszy
  const widgetId = currentWorkspace.templateSettings.scenarioWidgetTemplate;
  const ScenarioWidget = getWidgetComponent(widgetId);
  
  // Dodaj widget kontekstu, jeśli jest włączony w ustawieniach szablonu
  const showContextWidget = currentWorkspace.templateSettings.showContextWidget;
  const ContextWidget = showContextWidget ? getWidgetComponent('context-display') : null;
  
  // Jeśli nie ma widgetu, próbujemy użyć domyślnego widgetu card-list
  if (!ScenarioWidget) {
    console.warn(`[ScenarioView] Widget nie znaleziony: ${widgetId}, próba użycia card-list`);
    const DefaultWidget = getWidgetComponent('card-list');
    
    if (DefaultWidget) {
      // Użyj domyślnego widgetu, jeśli jest dostępny
      return (
        <LayoutComponent 
          title={currentWorkspace.name}
          showBackButton={true}
          onBackClick={handleBack}
        >
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              <strong>Uwaga:</strong> Widget <span className="font-mono">{widgetId}</span> nie jest dostępny. 
              Używam domyślnego widgetu.
            </p>
          </div>
          
          <DefaultWidget
            data={currentWorkspace.scenarios}
            onSelect={handleSelectScenario}
          />
          
          {/* Wyświetl widget kontekstu, jeśli jest włączony */}
          {ContextWidget && (
            <div className="mt-6">
              <ContextWidget 
                title="Workspace Context"
                onSelect={() => {}}
              />
            </div>
          )}
        </LayoutComponent>
      );
    }
    
    // Jeśli nawet domyślny widget nie jest dostępny, pokaż błąd
    return (
      <LayoutComponent 
        title={currentWorkspace.name}
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Widget nie znaleziony</h3>
          <p className="text-red-600 mb-3">
            Nie można znaleźć widgetu <span className="font-mono">{widgetId}</span> ani widgetu domyślnego.
          </p>
          
          <h4 className="font-medium mb-2">Lista scenariuszy:</h4>
          <ul className="bg-white p-3 border border-gray-200 rounded">
            {currentWorkspace.scenarios.map(scenario => (
              <li key={scenario.id} className="mb-2">
                <button
                  onClick={() => handleSelectScenario(scenario.id)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
                >
                  <div className="font-medium">{scenario.name}</div>
                  {scenario.description && (
                    <div className="text-sm text-gray-600">{scenario.description}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Wyświetl widget kontekstu, jeśli jest włączony */}
        {ContextWidget && (
          <div className="mt-6">
            <ContextWidget 
              title="Workspace Context"
              onSelect={() => {}}
            />
          </div>
        )}
      </LayoutComponent>
    );
  }
  
  // Renderuj widgety w layoucie
  return (
    <LayoutComponent 
      title={currentWorkspace.name}
      showBackButton={true}
      onBackClick={handleBack}
    >
      <ScenarioWidget
        data={currentWorkspace.scenarios}
        onSelect={handleSelectScenario}
      />
      
      {/* Wyświetl widget kontekstu, jeśli jest włączony */}
      {ContextWidget && (
        <div className="mt-6">
          <ContextWidget 
            title="Workspace Context"
            onSelect={() => {}}
          />
        </div>
      )}
    </LayoutComponent>
  );
};

export default ScenarioView;