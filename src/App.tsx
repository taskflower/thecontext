// src/App.tsx
import React, { memo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AppLoading, ScenarioWithStep, WorkspaceOverview } from "@/components";
import { AppConfig } from "@/core";
import { ContextDebugger } from "./debug";
import ConfigIndicator from "./components/ConfigIndicator";
import { ConfigProvider, useConfig } from "./ConfigProvider";



export const App: React.FC = () => (
  <ConfigProvider>
    <AppWithConfig />
  </ConfigProvider>
);

const LoadingState = memo(({ message }: { message: string }) => (
  <AppLoading message={message} />
));

const ErrorState = memo(({ error }: { error: string }) => (
  <div className="p-4 text-red-600">Błąd: {error}</div>
));

const NoConfigState = memo(() => (
  <div className="p-4 text-gray-700">Brak konfiguracji</div>
));

const AppRoutes = memo(({ config, configId }: { config: AppConfig, configId: string | null }) => (
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
));

const AppWithConfig: React.FC = () => {
  const { config, loading, error, configId, configType } = useConfig();

  if (loading) return <LoadingState message="Ładowanie konfiguracji..." />;
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
      <AppRoutes config={config} configId={configId} />
    </Router>
  );
};

export default App;