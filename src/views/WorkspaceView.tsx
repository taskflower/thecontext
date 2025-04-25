// src/views/WorkspaceView.tsx
import React, { useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl";
import { useApplicationStore } from "@/hooks/stateManagment/useApplicationStore";
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import { LayoutProps, WidgetProps } from "@/types";

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { fetchApplicationById, getCurrentApplication, isLoading, error } = useApplicationStore();
  const { selectWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (applicationId) {
      fetchApplicationById(applicationId);
    }
  }, [applicationId, fetchApplicationById]);

  const currentApplication = getCurrentApplication();
  const workspaces = currentApplication?.workspaces || [];

  const handleSelect = (workspaceId: string) => {
    selectWorkspace(workspaceId);
    navigate(`/${workspaceId}`);
  };

  const handleBackClick = () => navigate('/');

  // Przygotowanie danych dla widgetów
  const workspaceData = workspaces.map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || `Template: ${workspace.templateSettings.layoutTemplate}`,
    count: workspace.scenarios.length,
    countLabel: "scenarios",
    icon: workspace.icon || "briefcase",
  }));

  const headerData = {
    title: currentApplication?.name,
    description: currentApplication?.description,
    backLink: '/',
    backText: 'Wróć do listy aplikacji'
  };

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

    // Pobierz komponenty na podstawie konfiguracji aplikacji
    const layoutName = currentApplication.templateSettings?.layoutTemplate || "default";
    const LayoutComponent = getLayoutComponent(layoutName);
    
    if (!LayoutComponent) {
      return <div>Layout not found: {layoutName}</div>;
    }

    const LayoutComponentWithType = LayoutComponent as React.ComponentType<LayoutProps>;

    // Renderuj layout z dynamicznym zawartością na podstawie konfiguracji
    return (
      <LayoutComponentWithType title={currentApplication.name} onBackClick={handleBackClick}>
        {/* Renderuj widgety zgodnie z konfiguracją aplikacji */}
        {currentApplication.templateSettings?.widgets?.map((widgetConfig: any, index: number) => {
          const { type, data } = widgetConfig;
          const WidgetComponent = getWidgetComponent(type);
          
          if (!WidgetComponent) {
            return <div key={index}>Widget type not found: {type}</div>;
          }
          
          const WidgetComponentWithType = WidgetComponent as React.ComponentType<WidgetProps>;
          
          // Wybierz odpowiednie dane dla widgetu
          let widgetData;
          if (type === 'card-list' && data === 'workspaces') {
            widgetData = workspaceData;
          } else if (type === 'info' && data === 'header') {
            widgetData = headerData;
          } else {
            widgetData = widgetConfig.data || {};
          }
          
          return (
            <div key={index} className="mb-6">
              <WidgetComponentWithType 
                data={widgetData} 
                onSelect={type === 'card-list' ? handleSelect : (path) => navigate(path)}
                attrs={widgetConfig.attrs}
              />
            </div>
          );
        })}
        
        {/* Jeśli nie ma zdefiniowanych widgetów, pokaż domyślne */}
        {(!currentApplication.templateSettings?.widgets || currentApplication.templateSettings.widgets.length === 0) && (
          <>
            
            
            {workspaces.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-700">Brak dostępnych workspaces w tej aplikacji.</p>
              </div>
            ) : (
              (() => {
                const DefaultWidget = getWidgetComponent("card-list");
                if (!DefaultWidget) return <div>Default widget not found</div>;
                const DefaultWidgetWithType = DefaultWidget as React.ComponentType<WidgetProps>;
                return <DefaultWidgetWithType data={workspaceData} onSelect={handleSelect} />;
              })()
            )}
          </>
        )}
      </LayoutComponentWithType>
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