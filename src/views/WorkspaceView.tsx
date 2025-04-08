// src/views/WorkspaceView.tsx
import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { templateRegistry } from '../templates';

export const WorkspaceView: React.FC = () => {
  const { workspaces } = useAppStore();
  const navigate = useNavigate();

  // Używamy domyślnego szablonu layoutu dla widoku workspace
  const LayoutComponent = templateRegistry.getLayout('default')?.component;
  
  if (!LayoutComponent) {
    return <div className="p-4">Default layout template not found</div>;
  }
  
  // Używamy domyślnego szablonu widgetu dla widoku workspace
  const WidgetComponent = templateRegistry.getWidget('card-list')?.component;
  
  if (!WidgetComponent) {
    return <div className="p-4">Default widget template not found</div>;
  }

  const handleSelect = (workspaceId: string) => {
    // Navigate to the selected workspace
    navigate(`/${workspaceId}`);
  };

  // Map workspaces to the format expected by the widget
  const workspaceData = workspaces.map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    description: `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: 'scenarios'
  }));

  return (
    <Suspense fallback={<div className="p-4">Loading templates...</div>}>
      <LayoutComponent title="Workspaces">
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">
            Select a workspace to view its scenarios. Each workspace uses different template styles.
          </p>
          
          <WidgetComponent 
            data={workspaceData}
            onSelect={handleSelect}
          />
        </div>
      </LayoutComponent>
    </Suspense>
  );
};