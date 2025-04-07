/* eslint-disable @typescript-eslint/no-explicit-any */
// components/flow/FlowView.tsx
import React, { useEffect, useState } from "react";
import useStore from "../../store";
import { Node, Scenario } from "../../store/types";

interface NodeData extends Node {
  // Add any additional properties that might be added by nodeManager.prepareNodeForDisplay
  [key: string]: any;
}

const FlowView: React.FC = () => {
  // Pobieramy minimalne niezbędne dane ze store
  const workspaces = useStore(state => state.workspaces);
  const selectedIds = useStore(state => state.selectedIds);
  const flowState = useStore(state => state.flowState);
  const nodeManager = useStore(state => state.nodeManager);
  const contextItems = useStore(state => state.contextItems);
  
  // Używamy lokalnego stanu zamiast skomplikowanych selektorów
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  
  // Pobieramy funkcje tylko te, które są potrzebne
  const updateFlowInput = useStore(state => state.updateFlowInput);
  const nextStep = useStore(state => state.nextStep);
  const prevStep = useStore(state => state.prevStep);
  const finishFlow = useStore(state => state.finishFlow);
  const createNode = useStore(state => state.createNode);
  
  // Efekt do pobrania scenariusza
  useEffect(() => {
    if (selectedIds.workspace && selectedIds.scenario) {
      const workspace = workspaces.find(w => w.id === selectedIds.workspace);
      const foundScenario = workspace?.scenarios.find(s => s.id === selectedIds.scenario);
      setScenario(foundScenario || null);
      setNodes(foundScenario?.nodes || []);
    }
  }, [selectedIds, workspaces]);
  
  // Efekt do przygotowania bieżącego węzła
  useEffect(() => {
    if (!nodes.length || flowState.currentIndex >= nodes.length) {
      setCurrentNode(null);
      return;
    }
    
    const node = nodes[flowState.currentIndex];
    if (!node) {
      setCurrentNode(null);
      return;
    }
    
    try {
      const preparedNode = nodeManager.prepareNodeForDisplay(node.id, contextItems);
      setCurrentNode(preparedNode);
    } catch (error) {
      console.error("Error preparing node:", error);
      setCurrentNode(node as NodeData);
    }
  }, [nodes, flowState.currentIndex, nodeManager, contextItems]);

  if (nodes.length === 0) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">{scenario?.name || "Flow"}</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">Ten scenariusz nie ma jeszcze żadnych węzłów.</p>
          <button
            onClick={() => {
              const label = prompt("Nazwa węzła:");
              if (label?.trim()) createNode(label);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Dodaj pierwszy węzeł
          </button>
        </div>
      </div>
    );
  }

  if (!currentNode) return null;

  const isLastStep = flowState.currentIndex === nodes.length - 1;

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">{scenario?.name}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Informacje o kroku */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>
            Krok {flowState.currentIndex + 1} z {nodes.length}
          </span>
          <span>{currentNode.label}</span>
        </div>

        {/* Wiadomość asystenta */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-semibold mb-2">Wiadomość asystenta:</h3>
          <div className="text-gray-700 whitespace-pre-line">
            {currentNode.assistantMessage}
          </div>
        </div>

        {/* Input użytkownika */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Odpowiedź:</h3>
          <textarea
            value={flowState.userInput}
            onChange={(e) => updateFlowInput(e.target.value)}
            placeholder="Wpisz swoją odpowiedź..."
            className="w-full p-3 border rounded-lg"
            rows={4}
          />

          {currentNode.contextKey && (
            <div className="mt-2 text-xs text-gray-500">
              Odpowiedź zapisana w:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {currentNode.contextKey}
              </code>
              {currentNode.contextJsonPath && (
                <span>
                  {" "}
                  (ścieżka:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {currentNode.contextJsonPath}
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
            className={`px-4 py-2 rounded ${
              flowState.currentIndex === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            ← Wstecz
          </button>

          {isLastStep ? (
            <button
              onClick={finishFlow}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Zakończ
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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