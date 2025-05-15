// src/components/ScenarioLayout.tsx
import React, { Suspense, memo, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import Loading from "./Loading";
import { FlowEngine } from "@/core";

const ScenarioLayout: React.FC = memo(() => {
  const { configId, config } = useConfig();
  const {
    workspaceSlug = "",
    scenarioSlug = "",
    stepIndex = "0",
  } = useParams<{
    workspaceSlug?: string;
    scenarioSlug?: string;
    stepIndex?: string;
  }>();

  if (!config) return <Loading message="Ładowanie konfiguracji..." />;

  const redirectPath = useMemo(
    () => `/${configId}/${workspaceSlug || ""}`,
    [configId, workspaceSlug]
  );

  if (!workspaceSlug || !scenarioSlug) {
    return <Navigate to={redirectPath} replace />;
  }

  const scenario = useMemo(
    () =>
      config.scenarios.find(
        (s) => s.slug === scenarioSlug && s.workspaceSlug === workspaceSlug
      ),
    [config.scenarios, scenarioSlug, workspaceSlug]
  );

  if (!scenario) {
    return <div>Scenariusz nie znaleziony</div>;
  }

  const stepIdx = Number.isNaN(Number(stepIndex)) ? 0 : parseInt(stepIndex, 10);

  return (
    <Suspense fallback={<Loading message="Ładowanie kroku…" />}>
      <FlowEngine
        config={config}
        scenarioSlug={scenarioSlug}
        stepIdx={stepIdx}
      />
    </Suspense>
  );
});

export default ScenarioLayout;
