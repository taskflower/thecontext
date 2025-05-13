// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  ConfigIndicator,
  Loading,
  WorkspaceOverview,
  withSuspense,
} from "@/components";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import ScenarioLayout from "@/components/ScenarioLayout";
import { ContextDebugger } from "./debug";

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
        {/* Używamy teraz zagnieżdżonych ścieżek z wspólnym layoutem */}
        <Route
          path="/:configId/:workspaceSlug"
          element={<WorkspaceLayout config={config} />}
        >
          {/* Route dla widoku workspace */}
          <Route index element={<WorkspaceOverview config={config} />} />
          {/* Route dla scenariuszy */}
          <Route
            path=":scenarioSlug/:stepIndex?"
            element={<ScenarioLayout config={config} />}
          />
        </Route>
        <Route
          path="*"
          element={<div className="p-4">Strona nie znaleziona</div>}
        />
      </Routes>
      <ContextDebugger config={config} />
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