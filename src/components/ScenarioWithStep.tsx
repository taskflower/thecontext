// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FlowEngine } from "../core/engine";
import type { AppConfig } from "../core/types";
import LoadingSpinner from "./LoadingSpinner";
import { preloadLayout } from "@/preload";

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{
    workspaceSlug: string;
    scenarioSlug: string;
    stepIndex: string;
  }>();
  const stepIdx = Number.isNaN(Number(stepIndex))
    ? 0
    : parseInt(stepIndex as string, 10);
  const [transitioning, setTransitioning] = useState(false);
  const [prevIdx, setPrevIdx] = useState(stepIdx);

  const workspace = useMemo(
    () => config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );

  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useMemo(
    () => preloadLayout(tplDir, layoutFile),
    [tplDir, layoutFile]
  );

  // Animacja przejścia między krokami
  useEffect(() => {
    if (stepIdx === prevIdx) return;
    setTransitioning(true);
    const t = setTimeout(() => {
      setPrevIdx(stepIdx);
      setTransitioning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [stepIdx, prevIdx]);

  // Przygotuj dane kontekstowe dla layoutu
  const scenario = config.scenarios.find((s) => s.slug === scenarioSlug);
  const layoutContext = {
    workspace,
    scenario,
    stepIdx,
    totalSteps: scenario?.nodes.length || 0,
    transitioning,
  };

  return (
    <Suspense fallback={<LoadingSpinner message="Ładowanie scenariusza..." />}>
      <AppLayout context={layoutContext}>
        {!transitioning && scenarioSlug && (
          <FlowEngine
            config={config}
            scenarioSlug={scenarioSlug}
            stepIdx={stepIdx}
          />
        )}
        {transitioning && (
          <LoadingSpinner message="Przechodzenie do kolejnego kroku..." />
        )}
      </AppLayout>
    </Suspense>
  );
};

export default ScenarioWithStep;
