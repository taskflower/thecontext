// src/views/WorkspaceView.tsx - Updated with consistent icon support
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { getWidgetComponent, getLayoutComponent } from "../lib/templates";

export const WorkspaceView: React.FC = () => {
  const { workspaces } = useAppStore();
  const navigate = useNavigate();

  // Use default layout template
  const LayoutComponent = getLayoutComponent("default");
  if (!LayoutComponent) {
    return <div className="p-4">Default layout template not found</div>;
  }

  // Prefer icon-card-list if available, fallback to card-list
  let WidgetComponent = getWidgetComponent("icon-card-list");
  if (!WidgetComponent) {
    WidgetComponent = getWidgetComponent("card-list");
    if (!WidgetComponent) {
      return <div className="p-4">Default widget template not found</div>;
    }
  }

  const handleSelect = (workspaceId: string) => {
    // Navigate to the selected workspace
    navigate(`/${workspaceId}`);
  };

  // Map workspaces to the format expected by the widget - include icon
  const workspaceData = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description:
      workspace.description ||
      `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon, // Use icon from workspace or fallback to "briefcase"
  }));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-700 text-lg">Loading workspaces...</div>
        </div>
      }
    >
      <LayoutComponent>
        <WidgetComponent data={workspaceData} onSelect={handleSelect} />
      </LayoutComponent>
    </Suspense>
  );
};
