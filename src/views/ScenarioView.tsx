// src/views/ScenarioView.tsx - Fixed Version
import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { getWidgetComponent, getLayoutComponent } from '../lib/templates';

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
  
  // Pobierz komponent layoutu dla widoku
  const LayoutComponent = getLayoutComponent(templateSettings.layoutTemplate);
  if (!LayoutComponent) {
    return <div className="p-4">Layout template not found</div>;
  }
  
  // Pobierz komponent widgetu dla scenariusza - zamiast przypisywać do stałej, użyjmy zmiennej
  let WidgetComponent = getWidgetComponent(templateSettings.scenarioWidgetTemplate);
  if (!WidgetComponent) {
    // Jeśli nie znaleziono widgetu, użyj domyślnego (card-list)
    WidgetComponent = getWidgetComponent('card-list');
    if (!WidgetComponent) {
      return <div className="p-4">Default widget template not found</div>;
    }
  }
  
  // Obsługa wyboru scenariusza
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${currentWorkspace.id}/${scenarioId}`);
  };
  
  // Przygotuj dane w formacie odpowiednim dla widgetu
  const scenarioData = scenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.nodes?.length || 0,
    countLabel: "steps"
  }));
  
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LayoutComponent 
        title={`${currentWorkspace.name} - Scenarios`} 
        showBackButton={true}
        onBackClick={() => navigate('/')}
      >
        <WidgetComponent 
          data={scenarioData} 
          onSelect={handleSelectScenario} 
        />
      </LayoutComponent>
    </Suspense>
  );
};