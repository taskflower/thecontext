// src/views/ScenarioView.tsx
import React, { Suspense, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";

import { getLayoutComponent, getWidgetComponent } from "../tpl";  // Zaktualizowana ścieżka importu
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { Scenario, Workspace } from "@/types";

export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { workspace } = useParams();
  const { selectWorkspace, getCurrentWorkspace, isLoading } = useWorkspaceStore();
  
  // Podczas renderowania, ustawiamy aktualny workspace
  useEffect(() => {
    if (workspace) {
      selectWorkspace(workspace);
    }
  }, [workspace, selectWorkspace]);
  
  const currentWorkspace = getCurrentWorkspace() as Workspace | undefined;

  // Pokaż ładowanie
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-700 text-lg">Ładowanie...</div>
      </div>
    );
  }

  // Jeśli nie ma workspace, wróć do strony głównej
  if (!currentWorkspace) {
    return <Navigate to="/" replace />;
  }

  const LayoutComponent =
    getLayoutComponent(currentWorkspace.templateSettings?.layoutTemplate || "default") ||
    (() => <div>Layout Not Found</div>);

  const WidgetComponent =
    getWidgetComponent(
      currentWorkspace.templateSettings?.scenarioWidgetTemplate || "card-list"
    ) ||
    getWidgetComponent("card-list") ||
    (() => <div>Widget Not Found</div>);

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${currentWorkspace.id}/${scenarioId}`);
  };

  const scenarioData = (currentWorkspace.scenarios || []).map((scenario: Scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.nodes?.length || 0,
    countLabel: "steps",
    icon: scenario.icon || "default-icon",
  }));

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LayoutComponent>
        <WidgetComponent data={scenarioData} onSelect={handleSelectScenario} />
      </LayoutComponent>
    </Suspense>
  );
};

export default ScenarioView;