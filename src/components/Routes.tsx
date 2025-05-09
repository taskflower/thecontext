// src/components/FlowRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ScenarioWithStep, WorkspaceOverview } from ".";
import { AppConfig } from "@/core";


export const AppRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  const defaultWorkspace = config.workspaces[0]?.slug || "";

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`/${defaultWorkspace}`} replace />}
      />

      <Route
        path="/:workspaceSlug"
        element={<WorkspaceOverview config={config} />}
      />

      <Route
        path="/:workspaceSlug/:scenarioSlug/:stepIndex"
        element={<ScenarioWithStep config={config} />}
      />

      <Route
        path="*"
        element={<Navigate to={`/${defaultWorkspace}`} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
