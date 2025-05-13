// src/components/ScenarioLayout.tsx
import React, { Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import { AppConfig, FlowEngine } from "@/core";
import { useConfig } from "@/ConfigProvider";
import Loading from "./Loading";

interface ScenarioLayoutProps {
  config: AppConfig;
}

const ScenarioLayout: React.FC<ScenarioLayoutProps> = ({ config }) => {
  const { configId } = useConfig();
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
    return <Navigate to={`/${configId}/${workspaceSlug || ""}`} replace />;
  }

  const scenario = config.scenarios.find(
    (s) => s.slug === scenarioSlug && s.workspaceSlug === workspaceSlug
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
};

export default ScenarioLayout;
