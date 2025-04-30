// src/views/WorkspaceView.tsx
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComponents } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { useAppStore } from "@/useAppStore";

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  // Używanie zunifikowanego store
  const { 
    fetchApplicationById, 
    getCurrentApplication, 
    selectWorkspace,
    error
  } = useAppStore();
  
  // Pobieranie stanu ładowania ze store
  const isLoading = useAppStore(state => state.loading.application);
  
  // Pobieranie aktualnej aplikacji
  const currentApplication = getCurrentApplication();
  const workspaces = currentApplication?.workspaces || [];

  // Przygotowanie danych workspace do wyświetlenia
  const workspaceData = useMemo(() => {
    return workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || `Template: ${workspace.templateSettings?.template}`,
      count: workspace.scenarios?.length || 0,
      countLabel: "scenarios",
      icon: workspace.icon || "briefcase",
    }));
  }, [workspaces]);

  // Obsługa wyboru workspace
  const handleSelect = (workspaceId: string) => {
    selectWorkspace(workspaceId);
    navigate(`/${workspaceId}`);
  };

  const handleBackClick = () => navigate('/');


  // Pobranie danych aplikacji raz, gdy zmienia się applicationId
  useEffect(() => {
    if (applicationId) {
      fetchApplicationById(applicationId);
    }
  }, [applicationId, fetchApplicationById]);

  // Używanie nowego hooka useComponents
  const { 
    component: LayoutComponent, 
    error: layoutError, 
    isLoading: layoutLoading 
  } = useComponents('layout', 'Simple');

  // Używanie nowego hooka useComponents do ładowania komponentu karty
  const { 
    component: CardListComponent, 
    error: cardError, 
    isLoading: cardLoading 
  } = useComponents('widget', 'CardList');

  // Łączenie stanów ładowania i błędów
  const combinedLoading = isLoading || layoutLoading || cardLoading;
  const combinedError = error || layoutError || cardError;

  // Sprawdź, czy aplikacja istnieje
  if (!currentApplication && !combinedLoading) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">Nie znaleziono aplikacji o ID: {applicationId}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Wróć do listy aplikacji
          </button>
        </div>
      </div>
    );
  }

  // Renderowanie widoku workspace
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
                <p className="text-yellow-700">Brak dostępnych workspaces w tej aplikacji.</p>
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