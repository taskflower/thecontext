// src/InitialDataProvider.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "@/useAppStore";

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

  // Pobierz dane i akcje ze zunifikowanego store
  const { 
    fetchApplications, 
    selectApplication,
    fetchApplicationById,
    selectWorkspace, 
    selectScenario,
    getCurrentApplication
  } = useAppStore();
  
  const currentApplication = getCurrentApplication();
  const currentApplicationId = currentApplication?.id;

  // Inicjalne ładowanie danych aplikacji, jeśli nie są w URL
  useEffect(() => {
    if (!application && !workspace) {
      fetchApplications();
    }
  }, [fetchApplications, application, workspace]);
  
  // Ładowanie danych pojedynczej aplikacji, jeśli mamy ID w URL
  useEffect(() => {
    if (application && application !== currentApplicationId) {
      fetchApplicationById(application);
    }
  }, [application, currentApplicationId, fetchApplicationById]);

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