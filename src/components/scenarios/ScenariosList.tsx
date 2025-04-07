// components/scenarios/ScenariosList.tsx
import React from "react";
import ScenarioItem from "./ScenarioItem";
import useStore from "@/store";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={navigateBack}
            className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
          >
            ← Powrót
          </button>
          <h2 className="text-xl font-semibold">{workspace?.name || "Scenariusze"}</h2>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] h-6 w-6 rounded-full flex items-center justify-center hover:bg-opacity-90"
          title="Dodaj scenariusz"
        >+</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspace?.scenarios.map((scenario) => (
          <ScenarioItem key={scenario.id} scenario={scenario} />
        ))}

        {!workspace?.scenarios.length && (
          <div className="text-[hsl(var(--muted-foreground))] text-sm italic py-2">
            Brak scenariuszy
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosList;