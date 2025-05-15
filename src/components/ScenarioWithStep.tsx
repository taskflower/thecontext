// src/components/ScenarioWithStep.tsx
import React, { Suspense, memo } from "react";
import { FlowEngine } from "@/core";
import { Loading } from ".";
import { useConfig } from "@/ConfigProvider";

const ScenarioWithStep: React.FC = memo(() => {
  const { config } = useConfig();
  
  // Early return if config is not loaded
  if (!config) return <Loading message="Ładowanie konfiguracji..." />;
  
  return (
    <Suspense fallback={<Loading message="Ładowanie kroku…" />}>
      <FlowEngine
        config={config}
        scenarioSlug={undefined as any}
        stepIdx={undefined as any}
      />
    </Suspense>
  );
});

export default ScenarioWithStep;