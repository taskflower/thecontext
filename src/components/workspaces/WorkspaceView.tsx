// components/workspaces/WorkspaceView.tsx
import React from "react";

const WorkspaceView: React.FC = () => {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Wybierz workspace</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-700">
          Wybierz workspace z menu po lewej stronie lub utwórz nowy.
        </p>
        <p className="text-gray-500 text-sm">
          Workspaces to kontenery na scenariusze i węzły.
        </p>
      </div>
    </div>
  );
};

export default WorkspaceView;
