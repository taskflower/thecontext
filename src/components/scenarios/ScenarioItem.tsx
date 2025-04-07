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
      className="list-item"
      onClick={handleSelect}
    >
      <div>
        <div className="font-medium">{scenario.name}</div>
        {scenario.description && (
          <div className="text-xs text-muted-foreground mt-0.5">{scenario.description}</div>
        )}
      </div>
      <button 
        onClick={handleDelete} 
        className="text-destructive hover:text-destructive/80"
        aria-label="Usuń scenariusz"
      >
        ×
      </button>
    </div>
  );
};

export default ScenarioItem;