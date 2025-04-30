// src/views/ScenarioView.tsx
import React, { useEffect, useMemo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlow, useWidgets, useComponents } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import WidgetRenderer from "@/components/WidgetRenderer";
import { useAppStore } from "@/useAppStore";

export const ScenarioView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams();
  const navigate = useNavigate();
  const { selectWorkspace, selectScenario, error } = useAppStore();
  const isLoading = useAppStore(state => state.loading.workspace || state.loading.scenario);

  // Hook flow
  const { 
    currentNode, isFirstNode, isLastNode, 
    handleNext, handleBack,
    currentWorkspace, currentScenario
  } = useFlow();

  // Dane dla widoku listy
  const scenarioData = useMemo(() => {
    if (!currentWorkspace?.scenarios) return [];
    return currentWorkspace.scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description || "",
      icon: scenario.icon || "folder",
      count: scenario.nodes?.length || 0,
      countLabel: "kroków",
    }));
  }, [currentWorkspace]);

  // Widgety workspace
  const workspaceWidgets = useMemo(() => 
    currentWorkspace?.templateSettings?.widgets || [], 
    [currentWorkspace?.templateSettings?.widgets]
  );

  // Dane widgetów
  const { widgetData: workspaceWidgetData, isLoading: widgetsLoading, error: widgetsError } = 
    useWidgets(workspaceWidgets);

  // Wybór workspace i scenariusza
  useEffect(() => {
    if (workspaceId) selectWorkspace(workspaceId);
  }, [workspaceId, selectWorkspace]);

  useEffect(() => {
    if (scenarioId && workspaceId) selectScenario(scenarioId);
  }, [scenarioId, workspaceId, selectScenario]);

  // Obsługa wyboru
  const handleScenarioSelect = (id: string) => {
    if (workspaceId) navigate(`/${workspaceId}/${id}`);
  };

  // Obsługa elementu w widgecie
  const handleWidgetSelect = (itemId: string) => {
    if (itemId.startsWith("/")) {
      navigate(itemId);
    } else if (itemId.includes(":")) {
      const [action, target] = itemId.split(":");
      if (action === "navigate" && target) {
        navigate(target);
      } else if (action === "select" && target) {
        handleScenarioSelect(target);
      }
    }
  };

  // Komponenty UI
  const { component: LayoutComponent, error: layoutError, isLoading: layoutLoading } = 
    useComponents("layout", "Simple");

  const { component: CardListComponent, error: cardError, isLoading: cardLoading } = 
    useComponents("widget", "CardList");

  const { component: FlowStepComponent, error: flowStepError, isLoading: flowStepLoading } = 
    useComponents("flowStep", currentNode?.template || "form-step");

  // Stany ładowania i błędów
  const combinedLoading = isLoading || layoutLoading || widgetsLoading || 
    (scenarioId ? flowStepLoading : cardLoading);
  const combinedError = error || layoutError || widgetsError || 
    (scenarioId ? flowStepError : cardError);

  // Widgety workspace
  const renderWorkspaceWidgets = () => {
    if (workspaceWidgetData.length === 0) return null;

    return (
      <div className="space-y-6 mb-8">
        {workspaceWidgetData.map((widget, index) => (
          <div key={`workspace-widget-${index}`}>
            <WidgetRenderer
              type={widget.type}
              title={widget.title}
              description={widget.description}
              data={widget.data}
              onSelect={handleWidgetSelect}
              {...widget}
            />
          </div>
        ))}
      </div>
    );
  };

  // Zawartość
  const renderContent = () => {
    // Brak workspace
    if (!currentWorkspace) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Nie znaleziono workspace o ID: {workspaceId}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Wróć do listy workspace
            </button>
          </div>
        </div>
      );
    }

    // Lista scenariuszy (brak wybranego scenariusza)
    if (!scenarioId) {
      return (
        <div className="space-y-6">
          {renderWorkspaceWidgets()}

          {CardListComponent ? (
            <CardListComponent
              data={scenarioData}
              onSelect={handleScenarioSelect}
            />
          ) : (
            <div className="p-4">Ładowanie scenariuszy...</div>
          )}

          {scenarioData.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">
                Brak dostępnych scenariuszy w tym workspace.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Brak scenariusza
    if (!currentScenario) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Nie znaleziono scenariusza o ID: {scenarioId}</p>
            <button
              onClick={() => navigate(`/${workspaceId}`)}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Wróć do listy scenariuszy
            </button>
          </div>
        </div>
      );
    }

    // Brak węzła
    if (!currentNode) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Ten scenariusz nie zawiera żadnych kroków.</p>
            <button
              onClick={() => navigate(`/${workspaceId}`)}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Wróć do listy scenariuszy
            </button>
          </div>
        </div>
      );
    }

    // Renderowanie kroku flow
    return (
      <div className="space-y-6">
        {FlowStepComponent ? (
          <Suspense fallback={<div className="p-4">Ładowanie komponentu kroku...</div>}>
            <FlowStepComponent
              node={currentNode}
              onSubmit={handleNext}
              onPrevious={handleBack}
              isFirstNode={isFirstNode}
              isLastNode={isLastNode}
            />
          </Suspense>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700">Ładowanie szablonu dla kroku...</p>
          </div>
        )}
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
          stepTitle={currentNode?.label || (scenarioId ? undefined : "Wybierz scenariusz")}
          onBackClick={() => scenarioId ? navigate(`/${workspaceId}`) : navigate("/")}
        >
          {renderContent()}
        </LayoutComponent>
      ) : (
        <div className="p-4">Ładowanie layoutu...</div>
      )}
    </LoadingState>
  );
};

export default ScenarioView;