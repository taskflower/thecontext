// src/components/ScenarioWithStep.tsx
import React, { Suspense } from "react";
import { FlowEngine } from "@/core";
import Loading from "./Loading";

interface ScenarioWithStepProps {
  config: any;
}

const ScenarioWithStep: React.FC<ScenarioWithStepProps> = ({ config }) => {
  return (
    <Suspense fallback={<Loading message="Ładowanie kroku…" />}>
      <FlowEngine
        config={config}
        scenarioSlug={undefined as any}
        stepIdx={undefined as any}
      />
    </Suspense>
  );
};

export default ScenarioWithStep;