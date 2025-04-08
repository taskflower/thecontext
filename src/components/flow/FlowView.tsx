// components/flow/FlowView.tsx
import { useEffect, useState } from "react";
import useStore from "../../store";
import { Node, Scenario } from "../../store/types";
import NodesList from "../nodes/NodesList";
import ContextSection from "../context/ContextSection";
import FlowInput from "./FlowInput";
import { FlowHeader, FlowNavigationControls } from "./flowComponents";



const FlowView: React.FC = () => {
  // Pobieramy minimalne niezbędne dane ze store
  const workspaces = useStore((state) => state.workspaces);
  const selectedIds = useStore((state) => state.selectedIds);
  const flowState = useStore((state) => state.flowState);
  const currentFlowNode = useStore((state) => state.currentFlowNode);
  const navigateBack = useStore((state) => state.navigateBack);

  useStore((state) => state.nodeManager);
  useStore((state) => state.contextItems);

  // Używamy lokalnego stanu zamiast skomplikowanych selektorów
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  // Pobieramy funkcje tylko te, które są potrzebne
  const updateFlowInput = useStore((state) => state.updateFlowInput);
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
      <div className="p-8 bg-[hsl(var(--background))]">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={navigateBack}
            className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
          >
            ← Powrót
          </button>
          <h1 className="text-2xl font-semibold">{scenario?.name || "Flow"}</h1>
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <p className="mb-6 text-[hsl(var(--card-foreground))]">Ten scenariusz nie ma jeszcze żadnych węzłów.</p>
          <button
            onClick={() => {
              const label = prompt("Nazwa węzła:");
              if (label?.trim()) createNode(label);
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-colors hover:bg-opacity-90 px-4 py-2"
          >
            Dodaj pierwszy węzeł
          </button>
        </div>
      </div>
    );
  }

  if (!currentFlowNode) {
    return (
      <div className="p-8 bg-[hsl(var(--background))]">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={navigateBack}
            className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
          >
            ← Powrót
          </button>
          <h1 className="text-2xl font-semibold">{scenario?.name || "Flow"}</h1>
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <p className="text-[hsl(var(--card-foreground))]">Ładowanie węzła...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="md:col-span-2">
        {/* Nagłówek z nawigacją */}
        <FlowHeader 
          scenarioName={scenario?.name || "Flow"} 
          currentNodeIndex={flowState.currentIndex}
          totalNodes={nodes.length}
          currentNode={currentFlowNode}
          onBack={navigateBack}
        />

        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          {/* Wiadomość asystenta */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Wiadomość asystenta:</h3>
            <div className="bg-[hsl(var(--accent))] bg-opacity-50 p-4 rounded-md border border-[hsl(var(--border))]">
              <div className="text-[hsl(var(--foreground))] whitespace-pre-line">
                {currentFlowNode.assistantMessage}
              </div>
            </div>
          </div>

          {/* Input użytkownika - komponent dynamiczny */}
          <FlowInput 
            node={currentFlowNode}
            value={flowState.userInput}
            onChange={updateFlowInput}
          />

          {/* Przyciski nawigacyjne */}
          <FlowNavigationControls 
            currentIndex={flowState.currentIndex}
            totalNodes={nodes.length}
          />
        </div>
      </div>

      <div className="space-y-6">
        <NodesList />
        <ContextSection />
      </div>
    </div>
  );
};

export default FlowView;