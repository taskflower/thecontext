// src/views/ScenarioView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { getLayoutComponent, getWidgetComponent } from '../lib/templates';
import { useContextStore } from '../lib/contextStore';

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  
  // Pobierz dane workspace'a
  const { workspaces, selectWorkspace } = useAppStore();
  const { setActiveWorkspace } = useContextStore();
  
  // Ustawienie aktywnego workspace'a i inicjalizacja kontekstu
  useEffect(() => {
    if (workspaceId) {
      // Ustaw aktywny workspace w store aplikacji
      selectWorkspace(workspaceId);
      
      // Ustaw aktywny workspace w contextStore
      // To automatycznie zainicjuje kontekst z initialContext, jeśli jest potrzebne
      setActiveWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace, setActiveWorkspace]);
  
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  
  // Obsługa powrotu
  const handleBack = () => navigate('/');
  
  // Obsługa wyboru scenariusza
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${workspaceId}/${scenarioId}`);
  };
  
  // Jeśli nie ma workspace'a
  if (!currentWorkspace) {
    return <div>Workspace not found</div>;
  }
  
  // Pobierz layout
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings.layoutTemplate
  );
  
  // Pobierz widget scenariuszy
  const widgetId = currentWorkspace.templateSettings.scenarioWidgetTemplate;
  const ScenarioWidget = getWidgetComponent(widgetId);
  
  // Jeśli nie ma layoutu lub widgetu
  if (!LayoutComponent) return <div>Layout not found</div>;
  if (!ScenarioWidget) return <div>Widget not found</div>;
  
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
    </LayoutComponent>
  );
};

export default ScenarioView;