// src/views/FlowView.tsx
import React, { useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import { useFlow, useComponents, useAppStore } from "@/hooks";

export const FlowView: React.FC = () => {
  const { workspace, scenario } = useParams();
  const { selectWorkspace, selectScenario } = useAppStore();

  // Główny hook przepływu
  const {
    currentNode,
    isFirstNode,
    isLastNode,
    handleBack,
    handleNext,
    currentWorkspace,
    currentScenario: flowScenario,
  } = useFlow();

  // Inicjalizacja na podstawie parametrów URL
  useEffect(() => {
    if (workspace) selectWorkspace(workspace);
    if (scenario) selectScenario(scenario);
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  // Szablon i komponent
  const templateName =
    currentWorkspace?.templateSettings?.template || "default";
  const {
    component: LayoutComponent,
    error: layoutError,
    isLoading: layoutLoading,
  } = useComponents("layout", "Simple");

  const {
    component: FlowStepComponent,
    error: flowStepError,
    isLoading: componentLoading,
  } = useComponents("flowStep", currentNode?.template || "form-step");

  // Stany ładowania i błędów
  const isLoading = layoutLoading || componentLoading;
  const error = layoutError || flowStepError;
  const storeLoading = useAppStore(
    (state) => state.loading.workspace || state.loading.scenario
  );
  const storeError = useAppStore((state) => state.error);
  const fallbackLoader = (
    <SharedLoader message="Ładowanie komponentów..." fullScreen={true} />
  );

  // Render zawartości
  const renderContent = () => {
    // Weryfikacja danych
    if (!currentWorkspace || !flowScenario) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            Brak danych workspace lub scenariusza.
          </div>
        </div>
      );
    }

    if (!currentNode) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            Brak node dla aktualnego flow.
          </div>
        </div>
      );
    }

    if (!LayoutComponent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            <h3 className="font-bold">
              Błąd: Nie znaleziono komponentu layoutu
            </h3>
            <p className="mt-2">
              Szukany layout:{" "}
              <span className="font-mono bg-red-50 px-1">{templateName}</span>
            </p>
          </div>
        </div>
      );
    }

    if (!FlowStepComponent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            <h3 className="font-bold">
              Błąd: Nie znaleziono komponentu flow step
            </h3>
            <p className="mt-2">
              Szukany komponent:{" "}
              <span className="font-mono bg-red-50 px-1">
                {currentNode.template || "unknown"}
              </span>
            </p>
            <p className="mt-2">
              ID węzła:{" "}
              <span className="font-mono bg-red-50 px-1">{currentNode.id}</span>
            </p>
          </div>
        </div>
      );
    }

    // Renderuj komponent
    return React.createElement(LayoutComponent, {
      title: flowScenario.name,
      stepTitle: currentNode.label,
      onBackClick: handleBack,
      children: React.createElement(FlowStepComponent, {
        node: currentNode,
        onSubmit: handleNext,
        onPrevious: handleBack,
        isLastNode: isLastNode || false,
        isFirstNode: isFirstNode || false,
      }),
    });
  };

  return (
    <Suspense fallback={fallbackLoader}>
      <LoadingState
        isLoading={isLoading || storeLoading}
        error={error || storeError}
        loadingMessage="Ładowanie flow..."
        errorTitle="Błąd ładowania flow"
        onRetry={() => {
          if (workspace) selectWorkspace(workspace);
          if (scenario) selectScenario(scenario);
        }}
      >
        {renderContent()}
      </LoadingState>
    </Suspense>
  );
};

export default FlowView;
