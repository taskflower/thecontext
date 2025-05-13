// src/components/ScenarioWithStep.tsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { AppConfig, FlowEngine, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";
import { withSuspense } from "./withSuspense";

interface ScenarioWithStepProps {
  config: AppConfig;
}

const RawScenarioWithStep: React.FC<ScenarioWithStepProps> = ({ config }) => {
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
  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layout = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useLayout<{ children?: React.ReactNode; context?: any }>(tpl, layout);

  const scenario = config.scenarios.find((s) => s.slug === scenarioSlug);
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
        <FlowEngine config={config} scenarioSlug={scenarioSlug} stepIdx={stepIdx} />
      </AppLayout>
    </ThemeProvider>
  );
};

export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawScenarioWithStep })),
  'Ładowanie kroku…'
);
