// src/views/WorkspaceView.tsx
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComponents, useAppStore } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // Store
  const {
    fetchApplicationById,
    getCurrentApplication,
    selectWorkspace,
    error,
  } = useAppStore();
  const isLoading = useAppStore((state) => state.loading.application);

  // Dane aplikacji
  const currentApplication = getCurrentApplication();
  const workspaces = currentApplication?.workspaces || [];

  // Obsługa wyboru
  const handleSelect = (workspaceId: string) => {
    console.log("Kliknięto workspace:", workspaceId);
    selectWorkspace(workspaceId);
    navigate(`/${workspaceId}`);
  };

  // Pobierz nazwę layoutu z templateSettings pierwszego workspace lub użyj domyślnego "Simple"
  const layoutName = useMemo(() => {
    // Jeśli pierwszy workspace ma zdefiniowany layout, użyj go
    if (workspaces.length > 0 && workspaces[0].templateSettings?.layoutFile) {
      console.log(`Używam layoutu z konfiguracji pierwszego workspace: ${workspaces[0].templateSettings.layoutFile}`);
      return workspaces[0].templateSettings.layoutFile;
    }
    
    // Jeśli aplikacja ma domyślny layout, użyj go
    if (currentApplication?.defaultLayoutFile) {
      console.log(`Używam domyślnego layoutu aplikacji: ${currentApplication.defaultLayoutFile}`);
      return currentApplication.defaultLayoutFile;
    }
    
    console.log('Brak layoutu w konfiguracji, używam domyślnego "Simple"');
    return "Simple";
  }, [workspaces, currentApplication?.defaultLayoutFile]);

  // Dane do widoku
  const workspaceData = useMemo(
    () =>
      workspaces.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        description:
          workspace.description ||
          `Template: ${workspace.templateSettings?.tplDir}`,
        count: workspace.scenarios?.length || 0,
        countLabel: "scenarios",
        icon: workspace.icon || "briefcase"
      })),
    [workspaces]
  );

  // Nawigacja
  const handleBackClick = () => navigate("/");

  // Ładowanie aplikacji
  useEffect(() => {
    if (applicationId) fetchApplicationById(applicationId);
  }, [applicationId, fetchApplicationById]);

  // Komponenty UI - używamy dynamicznego layoutName
  const {
    component: LayoutComponent,
    error: layoutError,
    isLoading: layoutLoading,
  } = useComponents("layout", layoutName);

  const {
    component: CardListComponent,
    error: cardError,
    isLoading: cardLoading,
  } = useComponents("widget", "CardList");

  // Stany ładowania i błędów
  const combinedLoading = isLoading || layoutLoading || cardLoading;
  const combinedError = error || layoutError || cardError;

  // Brak aplikacji
  if (!currentApplication && !combinedLoading) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">
            Nie znaleziono aplikacji o ID: {applicationId}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Wróć do listy aplikacji
          </button>
        </div>
      </div>
    );
  }

  // Główny widok
  return (
    <LoadingState
      isLoading={combinedLoading}
      error={combinedError}
      loadingMessage="Ładowanie aplikacji..."
      errorTitle="Błąd ładowania"
      onRetry={() => applicationId && fetchApplicationById(applicationId)}
    >
      {LayoutComponent && (
        <LayoutComponent
          title={currentApplication?.name}
          onBackClick={handleBackClick}
        >
          <div className="space-y-6">
            {workspaces.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-700">
                  Brak dostępnych workspaces w tej aplikacji.
                </p>
              </div>
            ) : CardListComponent ? (
              <CardListComponent 
                data={workspaceData} 
                onSelect={handleSelect}
              />
            ) : (
              <div className="p-4">Ładowanie komponentu listy...</div>
            )}
          </div>
        </LayoutComponent>
      )}
    </LoadingState>
  );
};

export default WorkspaceView;