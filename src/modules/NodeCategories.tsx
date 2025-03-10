// src/components/NodeCategories.tsx
import React, { useState, useEffect } from 'react';
import { useGraphStore } from '../modules/graphStore';

const NodeCategories: React.FC = () => {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const categories = useGraphStore((state) => state.categories);
  const nodeResponses = useGraphStore((state) => state.nodeResponses);
  const removeNode = useGraphStore((state) => state.removeNode);

  // Lokalny stan do rozwijania/zamykania kategorii
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    categories.forEach(cat => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
    const incoming = edges.filter(edge => edge.target === nodeId).map(edge => edge.source);
    return { outgoing, incoming };
  };

  const renderNodeItem = (id: string, node: any) => {
    const { outgoing, incoming } = getNodeConnections(id);
    const hasResponse = nodeResponses[id] !== undefined;

    // W tej wersji funkcje podglądu/uruchomienia zastępujemy prostym logowaniem.
    const handlePreview = () => {
      console.log('Podgląd węzła:', id);
    };

    const handleExecute = () => {
      console.log('Uruchom węzeł:', id);
    };

    return (
      <div key={id} className="p-2 hover:bg-gray-50 rounded border-b last:border-b-0">
        <div className="flex justify-between items-center">
          <div className="font-medium">
            {id}
            {hasResponse && (<span className="ml-2 text-green-600 text-xs">✓</span>)}
          </div>
          <div className="flex space-x-2">
            <button onClick={handlePreview} className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600">
              Podgląd
            </button>
            <button onClick={handleExecute} className="bg-yellow-500 text-white px-2 py-1 text-xs rounded hover:bg-yellow-600">
              Uruchom
            </button>
            <button onClick={() => removeNode(id)} className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600">
              Usuń
            </button>
          </div>
        </div>
        {(incoming.length > 0 || outgoing.length > 0) && (
          <div className="mt-1 text-sm">
            {incoming.length > 0 && (
              <div className="text-gray-600">
                <span className="text-gray-400">← od: </span>
                {incoming.map((src, i) => (
                  <span key={i} className="inline-block bg-blue-100 px-1 rounded mr-1">
                    {src}
                  </span>
                ))}
              </div>
            )}
            {outgoing.length > 0 && (
              <div className="text-gray-600">
                <span className="text-gray-400">→ do: </span>
                {outgoing.map((tgt, i) => (
                  <span key={i} className="inline-block bg-green-100 px-1 rounded mr-1">
                    {tgt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {hasResponse && (
          <div className="mt-2 text-sm">
            <div className="font-medium text-gray-600">Odpowiedź:</div>
            <div className="bg-gray-50 p-2 rounded mt-1 border text-xs overflow-hidden text-ellipsis max-h-10">
              {nodeResponses[id]}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryFolder = (category: string) => {
    const isExpanded = expandedCategories[category] || false;
    const categoryNodes = Object.entries(nodes).filter(([_, node]) => node.category === category);
    if (categoryNodes.length === 0) return null;
    return (
      <div key={category} className="mb-2">
        <div
          className="flex items-center bg-gray-200 p-2 rounded-t cursor-pointer"
          onClick={() => toggleCategory(category)}
        >
          <span className="mr-2">{isExpanded ? '▼' : '►'}</span>
          <span className="font-bold">{category}</span>
          <span className="ml-2 text-gray-500 text-sm">({categoryNodes.length})</span>
        </div>
        {isExpanded && (
          <div className="border-l border-r border-b rounded-b p-2 bg-white">
            {categoryNodes.map(([id, node]) => renderNodeItem(id, node))}
          </div>
        )}
      </div>
    );
  };

  return <div>{categories.map(category => renderCategoryFolder(category))}</div>;
};

export default NodeCategories;
