// src/components/scenarios/ScenarioNodeCount.tsx
import React from "react";
import { useNodeStore } from "@/stores/nodeStore";

interface ScenarioNodeCountProps {
  scenarioId: string;
}

export const ScenarioNodeCount: React.FC<ScenarioNodeCountProps> = ({
  scenarioId,
}) => {
  const nodeCount = useNodeStore((state) =>
    state.getNodeCountByScenario(scenarioId)
  );
  
  return (
    <>
      {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
    </>
  );
};