// src/views/ApplicationWorkspaceView.tsx
import React, { useEffect, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl/templates";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

export const ApplicationWorkspaceView: React.FC = () => {
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

  const currentApplication = getCurrentApplication();
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
  const workspaceData = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description:
      workspace.description ||
      `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "briefcase",
  }));

  // Use a single loading state for initial data fetch
  // We want to show loading until we've either successfully loaded the application OR hit a definite error
  const isInitialLoading = isLoading || (!currentApplication && !error);
  
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-700 text-lg">Ładowanie aplikacji...</div>
      </div>
    );
  }

  // Show error only when we have a definite error and we're done loading
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">
          Błąd: {error}
          <button
            onClick={() => applicationId && fetchApplicationById(applicationId)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // At this point, we know we're not loading and don't have an error
  // If we still don't have currentApplication, it's truly not found
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

  // If we reach here, we have the application data
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-700 text-lg">Ładowanie komponentów...</div>
        </div>
      }
    >
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
    </Suspense>
  );
};

export default ApplicationWorkspaceView;