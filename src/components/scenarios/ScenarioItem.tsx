// components/scenarios/ScenarioItem.tsx
import useStore from "@/store";
import { Scenario } from "@/store/types";
import React from "react";

interface ScenarioItemProps {
  scenario: Scenario;
}

const ScenarioItem: React.FC<ScenarioItemProps> = ({ scenario }) => {
  const setSelectedIds = useStore((state) => state.setSelectedIds);
  const setView = useStore((state) => state.setView);
  const deleteScenario = useStore((state) => state.deleteScenario);

  const handleSelect = () => {
    setSelectedIds({ scenario: scenario.id });
    setView("flow");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Usunąć ten scenariusz?")) {
      deleteScenario(scenario.id);
    }
  };

  return (
    <div
      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleSelect}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{scenario.name}</h3>
        <button 
          onClick={handleDelete} 
          className="text-[hsl(var(--destructive))] hover:opacity-80"
          aria-label="Usuń scenariusz"
        >
          &times;
        </button>
      </div>
      {scenario.description && (
        <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {scenario.description}
        </div>
      )}
      <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
        {scenario.nodes.length} węzłów
      </div>
    </div>
  );
};

export default ScenarioItem;