// src/App.tsx
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Loading, ScenarioWithStep, WorkspaceOverview } from "@/components";
import { ContextDebugger } from "./debug";
import ConfigIndicator from "./components/ConfigIndicator";
import { ConfigProvider, useConfig } from "./ConfigProvider";

const ErrorState = ({ error }: { error: string }) => (
  <div className="p-4 text-red-600">Błąd: {error}</div>
);

const NoConfigState = () => (
  <div className="p-4 text-gray-700">Brak konfiguracji</div>
);

const AppContent = () => {
  const { config, loading, error, configId, configType } = useConfig();

  if (loading) return <Loading message="Ładowanie konfiguracji..." />;
  if (error) return <ErrorState error={error} />;
  if (!config) return <NoConfigState />;

  return (
    <Router>
      <ContextDebugger config={config} />
      <ConfigIndicator 
        configId={configId} 
        configType={configType} 
        config={config} 
      />
      <Suspense fallback={<Loading message="Ładowanie..." />}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/${configId}/${config.workspaces[0].slug}`} replace />}
          />
          <Route
            path="/:configId/:workspaceSlug"
            element={<WorkspaceOverview config={config} />}
          />
          <Route
            path="/:configId/:workspaceSlug/:scenarioSlug/:stepIndex?"
            element={<ScenarioWithStep config={config} />}
          />
          <Route
            path="*"
            element={<div className="p-4">Strona nie znaleziona</div>}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export const App = () => (
  <ConfigProvider>
    <AppContent />
  </ConfigProvider>
);

export default App;