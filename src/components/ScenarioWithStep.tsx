// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { preloadLayout } from "@/preload";
import { Loading } from ".";
import { AppConfig, FlowEngine } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const {
    configId,
    workspaceSlug = "",
    scenarioSlug = "",
    stepIndex = "0",
  } = useParams<{
    configId?: string,
    workspaceSlug?: string;
    scenarioSlug?: string;
    stepIndex?: string;
  }>();

  if (!workspaceSlug || !scenarioSlug) {
    return <Navigate to={`/${configId}`} replace />;
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

  const layoutContext = {
    workspace,
    scenario,
    stepIdx,
    totalSteps: scenario.nodes.length,
  };

  return (
    <ThemeProvider value={tpl}>
      <AppLayout context={layoutContext}>
        <Suspense fallback={<Loading message="Ładowanie kroku..." />}>
          <FlowEngine
            config={config}
            scenarioSlug={scenarioSlug}
            stepIdx={stepIdx}
          />
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  );
};

export default ScenarioWithStep;