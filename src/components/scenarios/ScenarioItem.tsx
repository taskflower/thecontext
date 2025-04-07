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
      className="flex justify-between items-center p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
      onClick={handleSelect}
    >
      <div>
        <div>{scenario.name}</div>
        {scenario.description && (
          <div className="text-xs text-gray-500">{scenario.description}</div>
        )}
      </div>
      <button onClick={handleDelete} className="text-red-500">
        ×
      </button>
    </div>
  );
};

export default ScenarioItem;
