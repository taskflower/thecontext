// src/views/WorkspaceView.tsx
import React, { useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl";
import { useApplicationStore } from "@/hooks/stateManagment/useApplicationStore";
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { fetchApplicationById, getCurrentApplication, isLoading, error } = useApplicationStore();
  const { selectWorkspace } = useWorkspaceStore();

  // Pobierz szczegóły aplikacji przy pierwszym renderowaniu
  useEffect(() => {
    if (applicationId) {
      fetchApplicationById(applicationId);
    }
  }, [applicationId, fetchApplicationById]);

  const currentApplication = getCurrentApplication();
  const workspaces = currentApplication?.workspaces || [];

  // Obsługa wyboru workspace
  const handleSelect = (workspaceId: string) => {
    selectWorkspace(workspaceId);
    // Nawigacja bezpośrednio do workspace/scenariuszy
    navigate(`/${workspaceId}`);
  };

  // Obsługa powrotu do strony głównej
  const handleBackClick = () => navigate('/');

  // Przygotuj dane dla widgetu
  const workspaceData = workspaces.map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "briefcase",
  }));

  // Render content with layout and widgets
  const renderContent = () => {
    if (!currentApplication) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg">
            Aplikacja o ID {applicationId} nie została znaleziona.
            <button onClick={handleBackClick} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
              Wróć do listy aplikacji
            </button>
          </div>
        </div>
      );
    }

    const LayoutComponent = getLayoutComponent("default") || (() => <div>Layout Not Found</div>);
    const WidgetComponent = getWidgetComponent("card-list") || (() => <div>Widget Not Found</div>);

    return (
      <LayoutComponent title={`${currentApplication.name}`} onBackClick={handleBackClick}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{currentApplication.name}</h1>
          <p className="text-gray-600">{currentApplication.description}</p>
          <button onClick={handleBackClick} className="mt-4 text-blue-600 hover:text-blue-800">
            &larr; Wróć do listy aplikacji
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Brak dostępnych workspaces w tej aplikacji.</p>
          </div>
        ) : (
          <WidgetComponent data={workspaceData} onSelect={handleSelect} />
        )}
      </LayoutComponent>
    );
  };

  return (
    <Suspense fallback={<SharedLoader message="Ładowanie komponentów..." fullScreen={true} />}>
      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Ładowanie aplikacji..."
        errorTitle="Błąd ładowania aplikacji"
        onRetry={() => applicationId && fetchApplicationById(applicationId)}
      >
        {renderContent()}
      </LoadingState>
    </Suspense>
  );
};

export default WorkspaceView;