// src/views/WorkspaceView.tsx
import React, {  Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { templateRegistry } from '@/lib/templates';


export const WorkspaceView: React.FC = () => {
  const { workspaces } = useAppStore();

  const navigate = useNavigate();

  // Get the default layout template
  const LayoutComponent = templateRegistry.getLayout('default')?.component;
  if (!LayoutComponent) {
    return <div className="p-4">Layout template not found</div>;
  }
  
  // Get the default workspace widget template
  const WidgetComponent = templateRegistry.getWidget('card-list')?.component;
  if (!WidgetComponent) {
    return <div className="p-4">Widget template not found</div>;
  }

  

  const handleSelect = (workspaceId: string) => {
    // Navigate to the selected workspace
    navigate(`/${workspaceId}`);
  };

  // Map workspaces to the format expected by the widget
  const workspaceData = workspaces.map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    count: workspace.scenarios.length,
    countLabel: 'scenarios'
  }));

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ładowanie szablonów...</p>
        </div>
      </div>
    }>
      <LayoutComponent title="Workspaces">
        <div className="space-y-6">
          
          
          <WidgetComponent 
            data={workspaceData}
            onSelect={handleSelect}
          />
        </div>
      </LayoutComponent>
    </Suspense>
  );
};