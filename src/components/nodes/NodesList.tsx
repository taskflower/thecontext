// components/nodes/NodesList.tsx
import React from "react";
import NodeItem from "./NodeItem";
import { AddButton, BackButton, EmptyState, Header } from "../theme";
import useStore from "@/store";

const NodesList: React.FC = () => {
  const nodes = useStore((state) => state.getNodes());
  const scenario = useStore((state) => state.getScenario());
  const navigateBack = useStore((state) => state.navigateBack);
  const createNode = useStore((state) => state.createNode);
  const editContext = useStore((state) => state.editContext);

  const handleCreate = () => {
    const label = prompt("Nazwa węzła:");
    if (label?.trim()) {
      createNode(label);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <BackButton onClick={navigateBack} />
        <div className="flex space-x-1">
          <button
            onClick={editContext}
            className="bg-green-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
            title="Edytuj kontekst"
          >
            C
          </button>
          <AddButton onClick={handleCreate} title="Dodaj węzeł" />
        </div>
      </div>

      <Header title={scenario?.name || "Węzły"} />

      <div className="space-y-2">
        {nodes.map((node, index) => (
          <NodeItem key={node.id} node={node} index={index} />
        ))}

        {nodes.length === 0 && <EmptyState message="Brak węzłów" />}
      </div>
    </div>
  );
};

export default NodesList;
