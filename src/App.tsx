// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLoading from "./components/Loading";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import WorkspaceOverview from "./components/WorkspaceOverview";
import ScenarioWithStep from "./components/ScenarioWithStep";
import { ContextDebugger } from "./debug";
import ConfigIndicator from "./components/ConfigIndicator";

export const App: React.FC = () => (
  <ConfigProvider>
    <AppWithConfig />
  </ConfigProvider>
);

const AppWithConfig: React.FC = () => {
  const { config, loading, error, configId, configType } = useConfig();

  if (loading) return <AppLoading message="Ładowanie konfiguracji..." />;
  if (error) return <div className="p-4 text-red-600">Błąd: {error}</div>;
  if (!config)
    return <div className="p-4 text-gray-700">Brak konfiguracji</div>;

  return (
    <Router>
      <ContextDebugger config={config} />
      <ConfigIndicator 
        configId={configId} 
        configType={configType} 
        config={config} 
      />
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
    </Router>
  );
};

export default App;