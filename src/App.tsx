// App.tsx
import { useEffect, useState } from "react";
import { WorkspaceView } from "./components/workspaces";
import { ScenarioView } from "./components/scenarios";
import FlowView from "./components/flow/FlowView";
import { NodeEditor } from "./components/nodes";
import { ContextEditor } from "./components/context";
import Sidebar from "./components/layout/Sidebar";
import useStore from "./store";

function App() {
  const view = useStore((state) => state.view);
  const selectedIds = useStore((state) => state.selectedIds);
  const nodeManager = useStore((state) => state.nodeManager);
  const workspaces = useStore((state) => state.workspaces);

  // Użyj useState zamiast pobierać funkcje ze store
  const [, setInitialized] = useState(false);

  // Zaktualizowana inicjalizacja nodeManager
  useEffect(() => {
    if (selectedIds.workspace && selectedIds.scenario) {
      // Znajdź scenariusz bezpośrednio
      const workspace = workspaces.find((w) => w.id === selectedIds.workspace);
      const scenario = workspace?.scenarios.find(
        (s) => s.id === selectedIds.scenario
      );

      if (scenario?.nodes.length) {
        // Zawsze odświeżaj węzły przy zmianie scenariusza
        nodeManager.importNodes(scenario.nodes);
        setInitialized(true);

        // Jeśli jesteśmy w widoku flow, przygotuj węzeł
        if (view === "flow") {
          const prepareNode = useStore.getState().prepareCurrentNode;
          prepareNode();
        }
      }
    }
  }, [
    selectedIds.workspace,
    selectedIds.scenario,
    workspaces,
    nodeManager,
    view,
  ]);

  // Renderowanie głównej zawartości
  const renderContent = () => {
    switch (view) {
      case "workspaces":
        return <WorkspaceView />;
      case "scenarios":
        return <ScenarioView />;
      case "flow":
        return <FlowView />;
      case "nodeEditor":
        return <NodeEditor />;
      case "contextEditor":
        return <ContextEditor />;
      default:
        return null;
    }
  };

  // Renderowanie aplikacji
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {renderContent()}
    </div>
  );
}

export default App;
