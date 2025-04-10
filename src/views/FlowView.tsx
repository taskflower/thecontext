// src/views/FlowView.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { getLayoutComponent, getFlowStepComponent } from '../lib/templates';

export const FlowView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams<{ workspace: string; scenario: string }>();
  const navigate = useNavigate();
  
  // Pobierz dane z Zustand store
  const { workspaces } = useAppStore();
  
  // Znajdź aktualny workspace i scenariusz
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  const currentScenario = currentWorkspace?.scenarios.find(s => s.id === scenarioId);
  
  // Znajdź pierwszy node w scenariuszu
  const currentNode = currentScenario?.nodes?.[0];
  
  // Handler powrotu do listy scenariuszy
  const handleBack = () => {
    navigate(`/${workspaceId}`);
  };
  
  // Obsługa przejścia do następnego kroku
  const handleNodeExecution = (value: any) => {
    // Tutaj byłaby logika przejścia do następnego kroku
    console.log('Node executed with value:', value);
  };
  
  // Jeśli nie mamy danych, wyświetl komunikat ładowania
  if (!currentNode || !currentScenario) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading node data...</p>
        </div>
      </div>
    );
  }
  
  // Pobierz komponent kroku flow
  const FlowStepComponent = getFlowStepComponent(currentNode.templateId || 'basic-step');
  
  // Jeśli nie znaleziono komponentu
  if (!FlowStepComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Flow step template not found</p>
        </div>
      </div>
    );
  }
  
  // Pobierz komponent layoutu
  const LayoutComponent = getLayoutComponent(
    currentWorkspace?.templateSettings.layoutTemplate || 'default'
  );
  
  // Jeśli nie znaleziono layoutu
  if (!LayoutComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Layout template not found</p>
        </div>
      </div>
    );
  }
  
  // Renderuj layout z komponentem flow step
  return (
    <LayoutComponent
      title={currentNode.label}
      showBackButton={true}
      onBackClick={handleBack}
    >
      <FlowStepComponent
        node={currentNode}
        onSubmit={handleNodeExecution}
        onPrevious={handleBack}
        isLastNode={false}
      />
    </LayoutComponent>
  );
};

export default FlowView;