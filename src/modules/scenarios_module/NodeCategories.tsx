// src/modules/scenario_module/NodeCategories.tsx
import React, { useState, useEffect } from "react";
import { useScenarioStore } from "./scenarioStore";

const NodeCategories: React.FC = () => {
  const nodes = useScenarioStore((state) => state.nodes);
  const edges = useScenarioStore((state) => state.edges);
  const categories = useScenarioStore((state) => state.categories);
  const nodeResponses = useScenarioStore((state) => state.nodeResponses);
  const removeNode = useScenarioStore((state) => state.removeNode);

  // Lokalny stan do rozwijania/zamykania kategorii
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
    const incoming = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
    return { outgoing, incoming };
  };

  const renderNodeItem = (id: string) => {
    const { outgoing, incoming } = getNodeConnections(id);
    const hasResponse = nodeResponses[id] !== undefined;

    const handlePreview = () => console.log("Podgląd węzła:", id);
    const handleExecute = () => console.log("Uruchom węzeł:", id);

    return (
      <div key={id} className="py-1 px-2 hover:bg-gray-50 border-b last:border-b-0">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">
            {id}
            {hasResponse && <span className="ml-1 text-green-600 text-xs">✓</span>}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handlePreview}
              className="bg-blue-500 text-white px-1.5 py-0.5 text-xs rounded hover:bg-blue-600"
            >
              Podgląd
            </button>
            <button
              onClick={handleExecute}
              className="bg-yellow-500 text-white px-1.5 py-0.5 text-xs rounded hover:bg-yellow-600"
            >
              Uruchom
            </button>
            <button
              onClick={() => removeNode(id)}
              className="bg-red-500 text-white px-1.5 py-0.5 text-xs rounded hover:bg-red-600"
            >
              Usuń
            </button>
          </div>
        </div>
        {(incoming.length > 0 || outgoing.length > 0) && (
          <div className="mt-0.5 text-xs flex flex-wrap items-center">
            {incoming.length > 0 && (
              <div className="text-gray-600 mr-2 flex items-center flex-wrap">
                <span className="text-gray-400 mr-0.5">← od: </span>
                {incoming.map((src, i) => (
                  <span key={i} className="inline-block bg-blue-100 px-1 rounded mr-1 mb-0.5">
                    {src}
                  </span>
                ))}
              </div>
            )}
            {outgoing.length > 0 && (
              <div className="text-gray-600 flex items-center flex-wrap">
                <span className="text-gray-400 mr-0.5">→ do: </span>
                {outgoing.map((tgt, i) => (
                  <span key={i} className="inline-block bg-green-100 px-1 rounded mr-1 mb-0.5">
                    {tgt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {hasResponse && (
          <div className="mt-1 text-xs">
            <div className="font-medium text-gray-600 text-xs">Odpowiedź:</div>
            <div className="bg-gray-50 p-1 rounded border text-xs overflow-hidden text-ellipsis max-h-8">
              {nodeResponses[id]}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryFolder = (category: string) => {
    const isExpanded = expandedCategories[category] || false;
    const categoryNodes = Object.entries(nodes).filter(
      ([_, node]) => node.category === category
    );
    if (categoryNodes.length === 0) return null;
    
    return (
      <div key={category} className="mb-1">
        <div
          className="flex items-center bg-gray-200 px-2 py-1 rounded-t cursor-pointer"
          onClick={() => toggleCategory(category)}
        >
          <span className="mr-1 text-xs">{isExpanded ? "▼" : "►"}</span>
          <span className="font-bold text-sm">{category}</span>
          <span className="ml-1 text-gray-500 text-xs">
            ({categoryNodes.length})
          </span>
        </div>
        {isExpanded && (
          <div className="border-l border-r border-b rounded-b bg-white divide-y divide-gray-100">
            {categoryNodes.map(([id]) => renderNodeItem(id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {categories.map((category) => renderCategoryFolder(category))}
    </div>
  );
};

export default NodeCategories;