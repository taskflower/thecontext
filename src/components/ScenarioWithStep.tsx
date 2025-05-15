// src/components/ScenarioWithStep.tsx
import React, { Suspense, memo } from "react";
import { FlowEngine } from "@/core";
import { Loading } from ".";
import { useConfig } from "@/ConfigProvider";

const ScenarioWithStep: React.FC = memo(() => {
  const { config } = useConfig();
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
