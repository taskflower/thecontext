// components/scenarios/ScenariosList.tsx
import React from "react";
import useStore from "../../store";
import { AddButton, BackButton, EmptyState, Header } from "../theme";
import ScenarioItem from "./ScenarioItem";

const ScenariosList: React.FC = () => {
  const workspace = useStore((state) => state.getWorkspace());
  const createScenario = useStore((state) => state.createScenario);
  const navigateBack = useStore((state) => state.navigateBack);

  const handleCreate = () => {
    const name = prompt("Nazwa scenariusza:");
    if (name?.trim()) {
      createScenario(name);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <BackButton onClick={navigateBack} />
        <AddButton onClick={handleCreate} title="Dodaj scenariusz" />
      </div>

      <Header title={workspace?.name || "Scenariusze"} />

      <div className="space-y-2">
        {workspace?.scenarios.map((scenario) => (
          <ScenarioItem key={scenario.id} scenario={scenario} />
        ))}

        {!workspace?.scenarios.length && (
          <EmptyState message="Brak scenariuszy" />
        )}
      </div>
    </div>
  );
};

export default ScenariosList;
