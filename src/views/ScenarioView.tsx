// src/views/ScenarioView.tsx
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlow, useWidgets, useComponents, useAppStore } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import WidgetRenderer from "@/components/WidgetRenderer";

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams();
  const navigate = useNavigate();
  const { selectWorkspace, selectScenario, error } = useAppStore();
  const isLoading = useAppStore(
    (state) => state.loading.workspace || state.loading.scenario
  );

  // Hook flow
  const {
    currentWorkspace,
    currentScenario,
  } = useFlow();

  // Wybór workspace i scenariusza
  useEffect(() => {
    if (workspaceId) selectWorkspace(workspaceId);
  }, [workspaceId, selectWorkspace]);

  useEffect(() => {
    if (scenarioId && workspaceId) selectScenario(scenarioId);
  }, [scenarioId, workspaceId, selectScenario]);

  // Widgety workspace
  const workspaceWidgets = useMemo(
    () => currentWorkspace?.templateSettings?.widgets || [],
    [currentWorkspace?.templateSettings?.widgets]
  );

  // Dane widgetów
  const {
    widgetData: workspaceWidgetData,
    isLoading: widgetsLoading,
    error: widgetsError,
  } = useWidgets(workspaceWidgets);

  // Komponenty UI
  const {
    component: LayoutComponent,
    error: layoutError,
    isLoading: layoutLoading,
  } = useComponents("layout", "Simple");

  // Stany ładowania i błędów
  const combinedLoading =
    isLoading ||
    layoutLoading ||
    widgetsLoading;
  const combinedError =
    error ||
    layoutError ||
    widgetsError;

  // Renderuj standardowe widgety
  const renderWorkspaceWidgets = () => {
    if (workspaceWidgetData.length === 0) return null;

    return (
      <div className="space-y-6 mb-8">
        {workspaceWidgetData.map((widget, index) => (
          <div key={`workspace-widget-${index}`}>
            <WidgetRenderer
              type={widget.tplFile}
              tplFile={widget.tplFile}
              title={widget.title}
              description={widget.description}
              data={widget.data}
              {...widget}
            />
          </div>
        ))}
      </div>
    );
  };

  // Główny widok
  return (
    <LoadingState
      isLoading={combinedLoading}
      error={combinedError}
      loadingMessage="Ładowanie..."
      errorTitle="Błąd ładowania"
      onRetry={() => {
        if (workspaceId) selectWorkspace(workspaceId);
        if (scenarioId) selectScenario(scenarioId);
      }}
    >
      {LayoutComponent ? (
        <LayoutComponent
          title={currentScenario?.name || currentWorkspace?.name}
          stepTitle={null}
          onBackClick={() => navigate("/")}
        >
          {/* Uproszczony widok - tylko widgety */}
          <div className="space-y-6">
            {renderWorkspaceWidgets()}
            
            {workspaceWidgetData.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-700">
                  Brak dostępnych widgetów w tym workspace.
                </p>
              </div>
            )}
          </div>
        </LayoutComponent>
      ) : (
        <div className="p-4">Ładowanie layoutu...</div>
      )}
    </LoadingState>
  );
};

export default ScenarioView;