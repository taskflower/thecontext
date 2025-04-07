// components/nodes/NodesList.tsx
import React from "react";
import NodeItem from "./NodeItem";
import useStore from "@/store";

const NodesList: React.FC = () => {
  const nodes = useStore((state) => state.getNodes());
 useStore((state) => state.getScenario());
  const createNode = useStore((state) => state.createNode);
  const editContext = useStore((state) => state.editContext);

  const handleCreate = () => {
    const label = prompt("Nazwa węzła:");
    if (label?.trim()) {
      createNode(label);
    }
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Węzły</h3>
        <div className="flex space-x-2">
          <button
            onClick={editContext}
            className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] h-6 w-6 rounded-full flex items-center justify-center hover:bg-opacity-80 text-xs font-medium"
            title="Edytuj kontekst"
          >
            C
          </button>
          <button
            onClick={handleCreate} 
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] h-6 w-6 rounded-full flex items-center justify-center hover:bg-opacity-90 text-xs font-medium"
            title="Dodaj węzeł"
          >+</button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {nodes.map((node, index) => (
          <NodeItem key={node.id} node={node} index={index} />
        ))}

        {nodes.length === 0 && (
          <div className="text-[hsl(var(--muted-foreground))] text-sm italic py-2">
            Brak węzłów
          </div>
        )}
      </div>
    </div>
  );
};

export default NodesList;