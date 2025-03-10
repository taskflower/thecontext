// src/modules/scenario_module/EdgeConnector.tsx
// (dawniej EdgeConnector.tsx)
import React, { useState } from 'react';
import { useScenarioStore } from './scenarioStore';


const EdgeConnector: React.FC = () => {
  const { nodes, addEdge } = useScenarioStore();
  const [edgeForm, setEdgeForm] = useState({ source: '', target: '' });

  const handleAddEdge = () => {
    if (edgeForm.source && edgeForm.target && edgeForm.source !== edgeForm.target) {
      addEdge(edgeForm.source, edgeForm.target);
      setEdgeForm({ source: '', target: '' });
    }
  };

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      <h2 className="font-bold mb-2">Połącz węzły (sekwencja kroków)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={edgeForm.source}
          onChange={(e) => setEdgeForm({ ...edgeForm, source: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">Wybierz węzeł źródłowy</option>
          {Object.keys(nodes).map(id => (
            <option key={`src-${id}`} value={id}>{id}</option>
          ))}
        </select>
        <select
          value={edgeForm.target}
          onChange={(e) => setEdgeForm({ ...edgeForm, target: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">Wybierz węzeł docelowy</option>
          {Object.keys(nodes).map(id => (
            <option key={`tgt-${id}`} value={id}>{id}</option>
          ))}
        </select>
        <button onClick={handleAddEdge} className="bg-green-500 text-white p-2 rounded">
          Połącz węzły
        </button>
      </div>
    </div>
  );
};

export default EdgeConnector;