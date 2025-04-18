// src/InitialDataProvider.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "./hooks/useWorkspaceStore";
import { initializeTemplates } from "./templates";

const InitialDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { workspace, scenario } = useParams<{
    workspace: string;
    scenario?: string;
  }>();
  const { workspaces, setInitialWorkspaces, selectWorkspace, selectScenario } =
    useWorkspaceStore();
  useEffect(() => {
    if (workspaces.length === 0) {
      const templatesData = initializeTemplates();
      setInitialWorkspaces(templatesData);
    }
  }, [workspaces.length, setInitialWorkspaces]);
  useEffect(() => {
    if (workspace) {
      console.log("Selecting workspace:", workspace);
      selectWorkspace(workspace);
    }

    if (scenario) {
      console.log("Selecting scenario:", scenario);
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  return <>{children}</>;
};

export default InitialDataProvider;
