// src/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import {
  WorkspaceLayout,
  WorkspaceOverview,
  ScenarioLayout,
} from "./components";
import { Loading } from "./components";

// Wrapper komponent który obsługuje loading/error dla workspace
const WorkspaceWrapper: React.FC = () => {
  const { config, workspace, loading, error } = useConfig();

  console.log('🏢 WorkspaceWrapper render:', { config: !!config, workspace: !!workspace, loading, error });

  if (loading) {
    return <Loading message="Ładowanie workspace..." />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold">Błąd ładowania workspace</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!config || !workspace) {
    return (
      <div className="p-4 text-yellow-600">
        <h1 className="text-xl font-bold">Ładowanie danych...</h1>
        <p>Config: {config ? '✅' : '❌'}, Workspace: {workspace ? '✅' : '❌'}</p>
      </div>
    );
  }

  return <WorkspaceLayout />;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Redirect z głównej strony */}
      <Route path="/" element={<Navigate to="/energyGrantApp" replace />} />
      
      {/* Workspace routes - tutaj ConfigProvider ma dostęp do parametrów */}
      <Route 
        path="/:configId/:workspaceSlug" 
        element={
          <ConfigProvider>
            <WorkspaceWrapper />
          </ConfigProvider>
        }
      >
        <Route index element={<WorkspaceOverview />} />
        
        {/* Scenario routes */}
        <Route path=":scenarioSlug" element={<ScenarioLayout />}>
          <Route index element={<Navigate to="0" replace />} />
          <Route path=":stepIndex" element={<ScenarioLayout />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Strona nie znaleziona</h1>
            <p className="mb-4">Nie znaleziono podanej strony.</p>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;