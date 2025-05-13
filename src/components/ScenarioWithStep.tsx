// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Loading } from ".";
import { AppConfig, FlowEngine, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";

interface LayoutProps {
  children?: React.ReactNode;
  context?: {
    workspace: any;
    scenario: any;
    stepIdx: number;
    totalSteps: number;
  };
}

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const {
    configId,
    workspaceSlug = "",
    scenarioSlug = "",
    stepIndex = "0",
  } = useParams<{
    configId?: string;
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

  // Używamy zoptymalizowanego hooka useLayout
  const AppLayout = useLayout<LayoutProps>(tpl, layout);

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