// src/views/ScenarioView.tsx
import React, { useEffect, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { templateRegistry } from '../lib/templates'; // Zaktualizowany import

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const { workspaces, selectWorkspace } = useAppStore();
  const navigate = useNavigate();

  // Set the selected workspace based on URL param
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);

  // Find the current workspace
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);

  if (!currentWorkspace) {
    return <div className="p-4">Workspace not found</div>;
  }

  // Get the layout template for this workspace
  const layoutTemplateId = currentWorkspace.templateSettings.layoutTemplate;
  const LayoutComponent = templateRegistry.getLayout(layoutTemplateId)?.component;

  if (!LayoutComponent) {
    return <div className="p-4">Layout template not found</div>;
  }

  // Get the scenario widget template for this workspace
  const widgetTemplateId = currentWorkspace.templateSettings.scenarioWidgetTemplate;
  const WidgetComponent = templateRegistry.getWidget(widgetTemplateId)?.component;

  if (!WidgetComponent) {
    return <div className="p-4">Widget template not found</div>;
  }

  const handleSelect = (scenarioId: string) => {
    // Navigate to the selected scenario
    navigate(`/${workspaceId}/${scenarioId}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Map scenarios to the format expected by the widget
  const scenarioData = currentWorkspace.scenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.nodes.length,
    countLabel: 'nodes'
  }));

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ładowanie szablonów...</p>
        </div>
      </div>
    }>
      <LayoutComponent 
        title={`${currentWorkspace.name} - Scenarios`}
        showBackButton={true}
        onBackClick={handleBackClick}
      >
        <div className="space-y-6">
          <WidgetComponent 
            data={scenarioData}
            onSelect={handleSelect}
          />
        </div>
      </LayoutComponent>
    </Suspense>
  );
};