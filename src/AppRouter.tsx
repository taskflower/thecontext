// src/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useConfig } from "./ConfigProvider";
import {
  WorkspaceLayout,
  WorkspaceOverview,
  ScenarioLayout,
} from "./components";

const AppRouter: React.FC = () => {
  const { config, configId } = useConfig();
  if (!config || !configId) return null;
  const defaultWorkspace = config.workspaces[0]?.slug;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${configId}`} replace />} />
      <Route
        path="/:configId"
        element={<Navigate to={`/${configId}/${defaultWorkspace}`} replace />}
      />
      <Route path="/:configId/:workspaceSlug" element={<WorkspaceLayout />}>
        <Route index element={<WorkspaceOverview />} />
        <Route path=":scenarioSlug">
          <Route index element={<Navigate to="0" replace />} />
          <Route path=":stepIndex" element={<ScenarioLayout />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Strona nie znaleziona</h1>
            <p className="mb-4">Nie znaleziono podanej strony.</p>
            <button
              onClick={() =>
                (window.location.href = `/${configId}/${defaultWorkspace}`)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Wróć do strony głównej
            </button>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
