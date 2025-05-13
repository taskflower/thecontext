// src/components/ScenarioLayout.tsx
import React, { Suspense } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AppConfig, FlowEngine, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";

interface ScenarioLayoutProps {
  config: AppConfig;
}

const ScenarioLayout: React.FC<ScenarioLayoutProps> = ({ config }) => {
  const {
    workspaceSlug = "",
    scenarioSlug = "",
    stepIndex = "0",
  } = useParams<{
    workspaceSlug?: string;
    scenarioSlug?: string;
    stepIndex?: string;
  }>();

  if (!workspaceSlug) {
    return <div>Brak workspace</div>;
  }
  if (!scenarioSlug) {
    return <Navigate to={`/${config.name}/${workspaceSlug}`} replace />;
  }

  const workspace = config.workspaces.find(
    (w) => w.slug === workspaceSlug
  );
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const scenario = config.scenarios.find(
    (s) => s.slug === scenarioSlug && s.workspaceSlug === workspaceSlug
  );
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;

  const stepIdx = Number.isNaN(Number(stepIndex))
    ? 0
    : parseInt(stepIndex, 10);

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useLayout<{
    children?: React.ReactNode;
    context?: any;
  }>(tpl, layoutFile);

  const layoutContext = {
    workspace,
    scenario,
    stepIdx,
    totalSteps: scenario.nodes.length,
  };

  return (
    <ThemeProvider value={tpl}>
      <AppLayout context={layoutContext}>
        <Suspense fallback={<Loading message="Ładowanie kroku…" />}>
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

export default ScenarioLayout;