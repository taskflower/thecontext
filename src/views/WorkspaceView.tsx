// src/views/WorkspaceView.tsx
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { getLayoutComponent, getWidgetComponent } from "../tpl/templates";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

export const WorkspaceView: React.FC = () => {
  const { workspaces } = useWorkspaceStore();
  const navigate = useNavigate();

  const LayoutComponent =
    getLayoutComponent("default") || (() => <div>Layout Not Found</div>);

  const WidgetComponent =
    getWidgetComponent("card-list") || (() => <div>Widget Not Found</div>);

  const handleSelect = (workspaceId: string) => {
    navigate(`/${workspaceId}`);
  };

  const workspaceData = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description:
      workspace.description ||
      `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "briefcase",
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

export default WorkspaceView;
