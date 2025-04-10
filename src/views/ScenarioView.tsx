// src/views/ScenarioView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { getLayoutComponent, getWidgetComponent } from '../lib/templates';

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  
  // Get workspace data and context
  const { workspaces, selectWorkspace, getCurrentWorkspace } = useAppStore();
  
  // Set active workspace and initialize context
  useEffect(() => {
    if (workspaceId) {
      console.log("[ScenarioView] Initializing workspace:", workspaceId);
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);
  
  const currentWorkspace = getCurrentWorkspace();
  
  // Handle return
  const handleBack = () => navigate('/');
  
  // Handle scenario selection
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${workspaceId}/${scenarioId}`);
  };
  
  // If workspace not found
  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Workspace not found</h2>
          <p className="text-gray-600 mb-4">
            Cannot find workspace with ID: <span className="font-mono">{workspaceId}</span>
          </p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to workspace list
          </button>
        </div>
      </div>
    );
  }
  
  // Get layout component
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings.layoutTemplate
  );
  
  if (!LayoutComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Layout not found</h2>
          <p className="text-gray-600 mb-4">
            Cannot find layout: <span className="font-mono">{currentWorkspace.templateSettings.layoutTemplate}</span>
          </p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to workspace list
          </button>
        </div>
      </div>
    );
  }
  
  // Get scenario widget
  const widgetId = currentWorkspace.templateSettings.scenarioWidgetTemplate;
  const ScenarioWidget = getWidgetComponent(widgetId);
  
  // Sprawdzenie czy widget jest typem context-widget
  const isContextWidget = widgetId === 'context-widget';
  
  // Jeśli to widget kontekstowy, ustaw odpowiednie atrybuty dla widgetu
  const contextWidgetAttrs = isContextWidget ? {
    fields: [
      { label: "Imię", contextPath: "userProfile.firstName" },
      { label: "Nazwisko", contextPath: "userProfile.lastName" },
      { label: "Email", contextPath: "userProfile.email" },
      { label: "Język", contextPath: "userProfile.preferences.language" },
      { label: "Ostatnia aktywność", contextPath: "userProfile.lastActivity" }
    ],
    title: "Dane Użytkownika",
    theme: "architectural"
  } : {};
  
  // Jeśli potrzebujemy wyświetlić również listę scenariuszy
  const CardListWidget = getWidgetComponent('simple-card');
  
  // If widget not found, try using default card-list widget
  if (!ScenarioWidget) {
    console.warn(`[ScenarioView] Widget not found: ${widgetId}, trying to use card-list`);
    const DefaultWidget = getWidgetComponent('card-list');
    
    if (DefaultWidget) {
      // Use default widget if available
      return (
        <LayoutComponent 
          title={currentWorkspace.name}
          showBackButton={true}
          onBackClick={handleBack}
        >
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              <strong>Warning:</strong> Widget <span className="font-mono">{widgetId}</span> is not available. 
              Using default widget.
            </p>
          </div>
          
          <DefaultWidget
            data={currentWorkspace.scenarios}
            onSelect={handleSelectScenario}
            attrs={{}} // Pass empty attrs object to avoid undefined props
          />
        </LayoutComponent>
      );
    }
    
    // If even default widget is not available, show error
    return (
      <LayoutComponent 
        title={currentWorkspace.name}
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Widget not found</h3>
          <p className="text-red-600 mb-3">
            Cannot find widget <span className="font-mono">{widgetId}</span> or default widget.
          </p>
          
          <h4 className="font-medium mb-2">Scenario list:</h4>
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
      </LayoutComponent>
    );
  }
  
  // Gdy mamy context-widget, wyświetl również listę scenariuszy
  if (isContextWidget && CardListWidget) {
    return (
      <LayoutComponent 
        title={currentWorkspace.name}
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="space-y-8">
          {/* Widget kontekstowy */}
          <div className="mb-6">
            <ScenarioWidget
              attrs={contextWidgetAttrs}
            />
          </div>
          
          {/* Lista scenariuszy */}
          <div>
            <h2 className="text-xl font-medium mb-4">Dostępne scenariusze</h2>
            <CardListWidget
              data={currentWorkspace.scenarios}
              onSelect={handleSelectScenario}
              attrs={{}}
            />
          </div>
        </div>
      </LayoutComponent>
    );
  }
  
  // Standardowe wyświetlenie widgetu
  return (
    <LayoutComponent 
      title={currentWorkspace.name}
      showBackButton={true}
      onBackClick={handleBack}
    >
      <ScenarioWidget
        data={currentWorkspace.scenarios}
        onSelect={handleSelectScenario}
        attrs={isContextWidget ? contextWidgetAttrs : {}}
      />
    </LayoutComponent>
  );
};

export default ScenarioView;