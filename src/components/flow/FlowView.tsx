// components/flow/FlowView.tsx
import { useEffect, useState } from "react";
import useStore from "../../store";
import { Node, Scenario } from "../../store/types";

const FlowView: React.FC = () => {
  // Pobieramy minimalne niezbędne dane ze store
  const workspaces = useStore((state) => state.workspaces);
  const selectedIds = useStore((state) => state.selectedIds);
  const flowState = useStore((state) => state.flowState);
  const currentFlowNode = useStore((state) => state.currentFlowNode);

  useStore((state) => state.nodeManager);
  useStore((state) => state.contextItems);

  // Używamy lokalnego stanu zamiast skomplikowanych selektorów
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  // Pobieramy funkcje tylko te, które są potrzebne
  const updateFlowInput = useStore((state) => state.updateFlowInput);
  const nextStep = useStore((state) => state.nextStep);
  const prevStep = useStore((state) => state.prevStep);
  const finishFlow = useStore((state) => state.finishFlow);
  const createNode = useStore((state) => state.createNode);
  const prepareCurrentNode = useStore((state) => state.prepareCurrentNode);

  // Efekt do pobrania scenariusza
  useEffect(() => {
    if (selectedIds.workspace && selectedIds.scenario) {
      const workspace = workspaces.find((w) => w.id === selectedIds.workspace);
      const foundScenario = workspace?.scenarios.find(
        (s) => s.id === selectedIds.scenario
      );
      setScenario(foundScenario || null);
      setNodes(foundScenario?.nodes || []);
    }
  }, [selectedIds, workspaces]);

  // Efekt do zainicjowania flow - przygotowanie pierwszego węzła
  useEffect(() => {
    // Przygotuj pierwszy węzeł gdy otwieramy widok flow
    if (nodes.length > 0) {
      console.log("Initializing flow with nodes:", nodes);
      prepareCurrentNode();
    }
  }, [nodes, prepareCurrentNode]);

  // Logujemy dla debugowania
  useEffect(() => {
    if (currentFlowNode) {
      console.log("Current flow node updated:", currentFlowNode);
    }
  }, [currentFlowNode]);

  if (nodes.length === 0) {
    return (
      <div className="flex-1 p-8 bg-background">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">{scenario?.name || "Flow"}</h1>
        <div className="card p-6">
          <p className="mb-6 text-card-foreground">Ten scenariusz nie ma jeszcze żadnych węzłów.</p>
          <button
            onClick={() => {
              const label = prompt("Nazwa węzła:");
              if (label?.trim()) createNode(label);
            }}
            className="btn btn-primary px-4 py-2"
          >
            Dodaj pierwszy węzeł
          </button>
        </div>
      </div>
    );
  }

  if (!currentFlowNode) {
    return (
      <div className="flex-1 p-8 bg-background">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">{scenario?.name || "Flow"}</h1>
        <div className="card p-6">
          <p className="text-card-foreground">Ładowanie węzła...</p>
        </div>
      </div>
    );
  }

  const isLastStep = flowState.currentIndex === nodes.length - 1;

  return (
    <div className="flex-1 p-8 bg-background">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{scenario?.name}</h1>

      <div className="card p-6">
        {/* Informacje o kroku */}
        <div className="flex justify-between items-center mb-6 text-sm text-muted-foreground">
          <span>
            Krok {flowState.currentIndex + 1} z {nodes.length}
          </span>
          <span>{currentFlowNode.label}</span>
        </div>

        {/* Wiadomość asystenta */}
        <div className="flow-message mb-6">
          <h3 className="text-sm font-medium mb-2">Wiadomość asystenta:</h3>
          <div className="text-foreground whitespace-pre-line">
            {currentFlowNode.assistantMessage}
          </div>
        </div>

        {/* Input użytkownika */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Odpowiedź:</h3>
          <textarea
            value={flowState.userInput}
            onChange={(e) => updateFlowInput(e.target.value)}
            placeholder="Wpisz swoją odpowiedź..."
            className="flow-textarea"
            rows={4}
          />

          {currentFlowNode.contextKey && (
            <div className="mt-2 text-xs text-muted-foreground">
              Odpowiedź zapisana w:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                {currentFlowNode.contextKey}
              </code>
              {currentFlowNode.contextJsonPath && (
                <span>
                  {" "}
                  (ścieżka:{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    {currentFlowNode.contextJsonPath}
                  </code>
                  )
                </span>
              )}
            </div>
          )}
        </div>

        {/* Przyciski nawigacyjne */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={flowState.currentIndex === 0}
            className={`btn ${
              flowState.currentIndex === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "btn-secondary"
            } px-4 py-2`}
          >
            ← Wstecz
          </button>

          {isLastStep ? (
            <button
              onClick={finishFlow}
              className="btn btn-primary px-4 py-2"
            >
              Zakończ
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="btn btn-primary px-4 py-2"
            >
              Dalej →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowView;