// components/scenarios/ScenarioView.tsx
import React from "react";
import useStore from "../../store";

const ScenarioView: React.FC = () => {
  const workspace = useStore((state) => state.getWorkspace());

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Workspace: {workspace?.name}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-700">
          Wybierz scenariusz z menu po lewej stronie lub utwórz nowy.
        </p>
        <p className="text-gray-500 text-sm">
          Scenariusze to sekwencje węzłów tworzące flow interakcji.
        </p>
      </div>
    </div>
  );
};

export default ScenarioView;
