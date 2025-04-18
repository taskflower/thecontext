// src/views/WorkspaceView.tsx - Updated with Icons
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { templateRegistry } from "../lib/templates";


export const WorkspaceView: React.FC = () => {
  const { workspaces } = useAppStore();
  const navigate = useNavigate();

  // Use default layout template for workspace view
  const LayoutComponent = templateRegistry.getLayout("default")?.component;

  if (!LayoutComponent) {
    return <div className="p-4">Default layout template not found</div>;
  }

  // Use default widget template for workspace view
  const WidgetComponent = templateRegistry.getWidget("card-list")?.component;

  if (!WidgetComponent) {
    return <div className="p-4">Default widget template not found</div>;
  }

  const handleSelect = (workspaceId: string) => {
    // Navigate to the selected workspace
    navigate(`/${workspaceId}`);
  };

  // Map workspaces to the format expected by the widget
  const workspaceData = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description: `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "general", // Dodajemy ikonę z workspace lub domyślną "general"
  }));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-700 text-lg">Loading workspaces...</div>
        </div>
      }
    >
      <LayoutComponent title="Workspaces">
        {/* Jeśli potrzeba, możemy dodać tutaj customowy header z ikoną */}
        <WidgetComponent data={workspaceData} onSelect={handleSelect} />
      </LayoutComponent>
    </Suspense>
  );
};