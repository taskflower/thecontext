// src/components/FlowRoutes.tsx
import React, { Suspense } from "react";
import type { AppConfig } from '../core/types';
import { Routes, Route, Navigate } from "react-router-dom";
import AppLoading from "./AppLoading";
import WorkspaceOverview from "./WorkspaceOverview";
import ScenarioWithStep from "./ScenarioWithStep";
import { ContextDebugger } from "@/debug";

const FlowRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  const defaultWorkspace = config.workspaces[0]?.slug || "";
  return (
    <div className="flex min-h-screen">
      <div id="app-content" className="w-full transition-all">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/${defaultWorkspace}`} replace />}
          />
          <Route
            path="/:workspaceSlug"
            element={
              <Suspense fallback={<AppLoading message="Ładowanie workspace..." />}>
                <WorkspaceOverview config={config} />
              </Suspense>
            }
          />
          <Route
            path="/:workspaceSlug/:scenarioSlug/:stepIndex"
            element={
              <Suspense
                fallback={<AppLoading message="Ładowanie scenariusza..." />}
              >
                <ScenarioWithStep config={config} />
              </Suspense>
            }
          />
          <Route
            path="/:workspaceSlug/:scenarioSlug"
            element={
              <Navigate to={`/${defaultWorkspace}/:scenarioSlug/0`} replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to={`/${defaultWorkspace}`} replace />}
          />
        </Routes>
      </div>
      <ContextDebugger config={config} />
    </div>
  );
};

export default FlowRoutes;