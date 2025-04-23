// src/views/ApplicationWorkspaceView.tsx
import React, { useEffect, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  templateSettings: {
    layoutTemplate: string;
  };
  scenarios: any[]; // Assuming 'any' for now, will investigate later
  icon?: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  description: string;
  count: number;
  countLabel: string;
  icon: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  workspaces: Workspace[];
}

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { fetchApplicationById, getCurrentApplication, isLoading, error } =
    useApplicationStore();
  const { selectWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  console.log(
    "ApplicationWorkspaceView rendering, applicationId:",
    applicationId
  );

  // Pobierz szczegóły aplikacji przy pierwszym renderowaniu
  useEffect(() => {
    if (applicationId) {
      console.log("Fetching application data for ID:", applicationId);
      fetchApplicationById(applicationId);
    }
  }, [applicationId, fetchApplicationById]);

  const currentApplication = getCurrentApplication() as Application | undefined;
  const workspaces = currentApplication?.workspaces || [];

  // Użyj domyślnego layoutu
  const LayoutComponent =
    getLayoutComponent("default") || (() => <div>Layout Not Found</div>);

  // Użyj card-list jako widgetu dla listy workspaces
  const WidgetComponent =
    getWidgetComponent("card-list") || (() => <div>Widget Not Found</div>);

  // Obsługa wyboru workspace
  const handleSelect = (workspaceId: string) => {
    console.log("handleSelect called with workspaceId:", workspaceId);
    console.log("Application ID:", applicationId);

    // Wybierz workspace w store
    selectWorkspace(workspaceId);

    // Nawiguj do strony scenariuszy
    console.log("Navigating to:", `/app/${applicationId}/${workspaceId}`);
    navigate(`/app/${applicationId}/${workspaceId}`);
  };

  // Przygotuj dane dla widgetu
  const workspaceData: WorkspaceData[] = workspaces.map((workspace: Workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description:
      workspace.description ||
      `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "briefcase",
  }));

  // Fallback loader for Suspense
  const fallbackLoader = <SharedLoader message="Ładowanie komponentów..." fullScreen={true} />;

  // Rendering when we have the application data
  const renderContent = () => {
    // If we don't have currentApplication, it's truly not found
    if (!currentApplication) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg">
            Aplikacja o ID {applicationId} nie została znaleziona.
            <button
              onClick={() => navigate("/")}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do listy aplikacji
            </button>
          </div>
        </div>
      );
    }

    return (
      <LayoutComponent
        title={`Aplikacja: ${currentApplication.name}`}
        onBackClick={() => navigate("/")}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{currentApplication.name}</h1>
          <p className="text-gray-600">{currentApplication.description}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800"
            >
              &larr; Wróć do listy aplikacji
            </button>
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">
              Brak dostępnych workspaces w tej aplikacji.
            </p>
          </div>
        ) : (
          <WidgetComponent data={workspaceData} onSelect={handleSelect} />
        )}
      </LayoutComponent>
    );
  };

  return (
    <Suspense fallback={fallbackLoader}>
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