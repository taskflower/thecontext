// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ConfigIndicator,
  Loading,
  WorkspaceOverview,
  withSuspense,
} from "@/components";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import ScenarioLayout from "@/components/ScenarioLayout";

const RawAppContent: React.FC = () => {
  const { config, loading, error, configId } = useConfig();
  if (loading) return <Loading message="Ładowanie konfiguracji..." />;
  if (error) return <div className="p-4 text-red-600">Błąd: {error}</div>;
  if (!config) return <div className="p-4 text-gray-700">Brak konfiguracji</div>;

  return (
    <Router>
      <ConfigIndicator configId={configId!} configType={null!} config={config} />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={`/${configId}/${config.workspaces[0].slug}`}
              replace
            />
          }
        />
        <Route
          path="/:configId/:workspaceSlug"
          element={<WorkspaceOverview config={config} />}
        />
        <Route
          path="/:configId/:workspaceSlug/:scenarioSlug/:stepIndex?"
          element={<ScenarioLayout config={config} />}
        />
        <Route
          path="*"
          element={<div className="p-4">Strona nie znaleziona</div>}
        />
      </Routes>
    </Router>
  );
};

const LazyAppContent = React.lazy(
  () => Promise.resolve({ default: RawAppContent })
);
const AppContent = withSuspense(LazyAppContent, "Ładowanie…");

export const App = () => (
  <ConfigProvider>
    <AppContent />
  </ConfigProvider>
);

export default App;