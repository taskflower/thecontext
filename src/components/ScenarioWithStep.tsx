// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { preloadLayout } from "@/preload";
import { Loading } from ".";
import { AppConfig, FlowEngine } from "@/core";

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const {
    workspaceSlug = "",
    scenarioSlug = "",
    stepIndex = "0",
  } = useParams<{
    workspaceSlug?: string;
    scenarioSlug?: string;
    stepIndex?: string;
  }>();

  if (!workspaceSlug || !scenarioSlug) {
    return <Navigate to="/" replace />;
  }

  const stepIdx = Number.isNaN(Number(stepIndex)) ? 0 : parseInt(stepIndex, 10);

  const workspace = useMemo(
    () => config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layout = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useMemo(() => preloadLayout(tpl, layout), [tpl, layout]);

  const scenario = useMemo(
    () => config.scenarios.find((s) => s.slug === scenarioSlug),
    [config.scenarios, scenarioSlug]
  );
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;

  return (
    <AppLayout
      context={{
        workspace,
        scenario,
        stepIdx,
        totalSteps: scenario.nodes.length,
      }}
    >
      <Suspense fallback={<Loading message="Ładowanie kroku..." />}>
        <FlowEngine
          config={config}
          scenarioSlug={scenarioSlug}
          stepIdx={stepIdx}
        />
      </Suspense>
    </AppLayout>
  );
};

export default ScenarioWithStep;
