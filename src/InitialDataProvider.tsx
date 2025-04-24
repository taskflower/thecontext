// src/InitialDataProvider.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "./hooks/stateManagment/useWorkspaceStore";
import { useApplicationStore } from "./hooks/stateManagment/useApplicationStore";

interface InitialDataProviderProps {
  children: React.ReactNode;
}

const InitialDataProvider: React.FC<InitialDataProviderProps> = ({ children }) => {
  // Pobierz parametry z URL
  const { application, workspace, scenario } = useParams<{
    application?: string;
    workspace?: string;
    scenario?: string;
  }>();

  // Pobierz dane i akcje ze store'ów
  const { 
    fetchApplications, 
    selectApplication,
    currentApplicationId 
  } = useApplicationStore();
  
  const { 
    selectWorkspace, 
    selectScenario,
    fetchWorkspaces
  } = useWorkspaceStore();

  // Inicjalne ładowanie danych aplikacji, jeśli nie są w URL
  useEffect(() => {
    if (!application && !workspace) {
      fetchApplications();
    }
  }, [fetchApplications, application, workspace]);
  
  // Ładowanie danych workspaces, jeśli nie ma application w URL
  useEffect(() => {
    if (!application && workspace) {
      fetchWorkspaces();
    }
  }, [fetchWorkspaces, application, workspace]);

  // Wybierz aplikację na podstawie URL
  useEffect(() => {
    if (application && application !== currentApplicationId) {
      selectApplication(application);
    }
  }, [application, currentApplicationId, selectApplication]);

  // Wybierz workspace i scenariusz na podstawie URL
  useEffect(() => {
    if (workspace) {
      selectWorkspace(workspace);
    }
    
    if (scenario) {
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  return <>{children}</>;
};

export default InitialDataProvider;