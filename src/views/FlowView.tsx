// src/views/FlowView.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { getLayoutComponent, getFlowStepComponent } from "../lib/templates";

export const FlowView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams<{
    workspace: string;
    scenario: string;
  }>();
  const navigate = useNavigate();

  // Pobierz dane z Zustand store
  const { workspaces, selectWorkspace, selectScenario } = useAppStore();

  // Stan dla aktualnego indeksu kroku
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  // Ustaw aktywny workspace i scenariusz
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }

    if (scenarioId) {
      selectScenario(scenarioId);
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario]);

  // Znajdź aktualny workspace i scenariusz
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);
  const currentScenario = currentWorkspace?.scenarios.find(
    (s) => s.id === scenarioId
  );

  // Pobierz tablicę wszystkich nodeów dla scenariusza
  const nodes = currentScenario?.nodes || [];

  // Znajdź aktualny node bazując na indeksie
  const currentNode = nodes[currentNodeIndex];

  // Sprawdź czy to ostatni krok
  const isLastNode = currentNodeIndex === nodes.length - 1;

  // Handler powrotu do listy scenariuszy
  const handleBack = () => {
    navigate(`/${workspaceId}`);
  };

  // Handler przejścia do poprzedniego kroku
  const handlePrevious = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    } else {
      // Jeśli jesteśmy już na pierwszym kroku, wróć do listy scenariuszy
      handleBack();
    }
  };

  // Obsługa przejścia do następnego kroku
  const handleNodeExecution = (value: any) => {
    console.log("Node executed with value:", value);

    // Tutaj byłaby logika zapisywania danych z kroku
    // np. updateContext(currentNode.contextKey, value);

    if (isLastNode) {
      // Jeśli to ostatni krok, wróć do listy scenariuszy
      handleBack();
    } else {
      // Przejdź do następnego kroku
      setCurrentNodeIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Jeśli nie mamy danych, wyświetl komunikat ładowania
  if (!currentNode || !currentScenario) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading node data...</p>
        </div>
      </div>
    );
  }

  // Pobierz komponent kroku flow
  const FlowStepComponent = getFlowStepComponent(
    currentNode.templateId || "basic-step"
  );

  // Jeśli nie znaleziono komponentu
  if (!FlowStepComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Flow step template not found</p>
        </div>
      </div>
    );
  }

  // Pobierz komponent layoutu
  const LayoutComponent = getLayoutComponent(
    currentWorkspace?.templateSettings.layoutTemplate || "default"
  );

  // Jeśli nie znaleziono layoutu
  if (!LayoutComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Layout template not found</p>
        </div>
      </div>
    );
  }

  // Renderuj layout z komponentem flow step
  return (
    <>
      <LayoutComponent
        title={currentNode.label}
        showBackButton={true}
        onBackClick={handlePrevious}
      >
        <FlowStepComponent
          node={currentNode}
          onSubmit={handleNodeExecution}
          onPrevious={handlePrevious}
          isLastNode={isLastNode}
        />
      </LayoutComponent>

      {/* Opcjonalny debugger - możesz usunąć w wersji produkcyjnej */}
      {process.env.NODE_ENV !== "production" && (
        <div className="p-3 fixed left-0 w-full bottom-0 border-t text-xs text-gray-500 border-zinc-300">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(
                {
                  currentNodeIndex,
                  totalNodes: nodes.length,
                  isLastNode,
                  currentNodeId: currentNode.id,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </>
  );
};

export default FlowView;
