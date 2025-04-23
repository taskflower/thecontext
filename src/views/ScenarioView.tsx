// src/views/ScenarioView.tsx
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { getLayoutComponent, getWidgetComponent } from "../tpl/templates";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { Scenario } from "@/types";

export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useWorkspaceStore();
  const currentWorkspace = getCurrentWorkspace();

  if (!currentWorkspace) {
    navigate("/");
    return null;
  }

  const LayoutComponent =
    getLayoutComponent(currentWorkspace.templateSettings.layoutTemplate) ||
    (() => <div>Layout Not Found</div>);

  const WidgetComponent =
    getWidgetComponent(
      currentWorkspace.templateSettings.scenarioWidgetTemplate
    ) ||
    getWidgetComponent("card-list") ||
    (() => <div>Widget Not Found</div>);

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${currentWorkspace.id}/${scenarioId}`);
  };

  const scenarioData = currentWorkspace.scenarios.map((scenario: Scenario) => ({
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
