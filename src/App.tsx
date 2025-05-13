// src/App.tsx
import React, { lazy, Suspense, memo } from "react";
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
  WorkspaceLayout,
  ScenarioLayout,
} from "@/components";
import { ConfigProvider, useConfig } from "./ConfigProvider";
import { ContextDebugger } from "./debug";

// Komponent aplikacji - zoptymalizowany z memo
const RawAppContent: React.FC = memo(() => {
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
        {/* Używamy zagnieżdżonych ścieżek z wspólnym layoutem */}
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
});

// Lazy-loading głównego komponentu aplikacji
const LazyAppContent = lazy(
  () => Promise.resolve({ default: RawAppContent })
);

// Komponent z obsługą Suspense
const AppContent = withSuspense(LazyAppContent, "Ładowanie…");

// Główny komponent aplikacji
export const App = memo(() => (
  <ConfigProvider>
    <AppContent />
  </ConfigProvider>
));

export default App;