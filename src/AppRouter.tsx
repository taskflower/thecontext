// src/AppRouter.tsx
import React, { useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useConfig } from "./ConfigProvider";
import {
  WorkspaceLayout,
  WorkspaceOverview,
  ScenarioLayout,
} from "./components";

const AppRouter: React.FC = () => {
  const { config, configId } = useConfig();
  const location = useLocation();

  if (!config || !configId) return null;

  // Wybierz domyślny workspace (użyj defaultWorkspace z konfiguracji lub pierwszy workspace z listy)
  const defaultWorkspace =
    config.defaultWorkspace || config.workspaces[0]?.slug;

  // Funkcja do ustalania domyślnej ścieżki bazowej na podstawie configId
  const getDefaultPath = useMemo(() => {
    // Podstawowa ścieżka do workspace
    let basePath = `/${configId}/${defaultWorkspace}`;

    // Jeśli podano domyślny scenariusz, sprawdź czy istnieje i należy do domyślnego workspace
    if (config.defaultScenario) {
      const defaultScenario = config.scenarios.find(
        (s) =>
          s.slug === config.defaultScenario &&
          s.workspaceSlug === defaultWorkspace
      );

      if (defaultScenario) {
        // Dodaj domyślny scenariusz do ścieżki
        basePath = `${basePath}/${defaultScenario.slug}/0`;
      }
    }

    return basePath;
  }, [configId, config, defaultWorkspace]);

  // Sprawdź, czy jesteśmy dokładnie na ścieżce /:configId
  // Jeśli tak, to musimy przekierować do domyślnej ścieżki
  const shouldRedirectToDefault = location.pathname === `/${configId}`;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${configId}`} replace />} />

      {/* Przekieruj z "/:configId" na domyślną ścieżkę */}
      <Route
        path="/:configId"
        element={
          shouldRedirectToDefault ? (
            <Navigate to={getDefaultPath} replace />
          ) : null
        }
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
