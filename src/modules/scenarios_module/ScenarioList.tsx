// src/modules/scenarios_module/ScenarioList.tsx
import React from 'react';
import { useScenariosMultiStore } from './scenariosMultiStore';
import { Button } from "@/components/ui/button";
import MCard from "@/components/MCard";

const ScenarioList: React.FC = () => {
  const { scenarios, currentScenarioId, setCurrentScenario, syncCurrentScenarioToActive } = useScenariosMultiStore();
  const scenarioEntries = Object.entries(scenarios || {});

  if (scenarioEntries.length === 0) {
    return <div>No scenarios available.</div>;
  }

  return (
    <div className="space-y-4">
      {scenarioEntries.map(([id, scenario]) => (
        <MCard
          key={id}
          title={id}
          className={currentScenarioId === id ? 'bg-blue-50' : ''}
          description={<div className="flex space-x-4">
            <div>Nodes: {Object.keys(scenario.nodes ?? {}).length}</div>
            <div>Connections: {(scenario.edges ?? []).length}</div>
            <div>Categories: {(scenario.categories ?? []).length}</div>
          </div>}
          footer={<Button
            onClick={() => {
              setCurrentScenario(id);
              // Sync the selected scenario to the active store
              syncCurrentScenarioToActive();
            }}
            className="w-full"
            variant={currentScenarioId === id ? "default" : "outline"}
          >
            {currentScenarioId === id ? 'Selected' : 'Select Scenario'}
          </Button>} children={undefined}        />
      ))}
    </div>
  );
};

export default ScenarioList;