// src/modules/scenarios_module/ScenarioStats.tsx
import React from "react";
import MCard from "@/components/MCard";
import { useScenarioStore } from "../scenarioStore";

const ScenarioStats: React.FC = () => {
  const { nodes, edges } = useScenarioStore();

  return (
    <MCard
      title="Current Scenario Stats"
      description="Overview of the current scenario"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium">Nodes</div>
          <div className="text-2xl font-bold mt-1">
            {Object.keys(nodes).length}
          </div>
        </div>
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium">Connections</div>
          <div className="text-2xl font-bold mt-1">{edges.length}</div>
        </div>
      </div>
    </MCard>
  );
};

export default ScenarioStats;