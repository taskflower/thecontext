// src/modules/sequence_module/SequenceConnections.tsx
// (dawniej SequenceConnections.tsx)
import React from 'react';
import { useScenarioStore } from '../scenarios_module/scenarioStore';



const SequenceConnections: React.FC = () => {
  const { edges, removeEdge } = useScenarioStore();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="font-bold mb-2">Połączenia sekwencji</h2>
      {edges.length === 0 ? (
        <p className="text-gray-500">Brak połączeń</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {edges.map((edge, index) => (
            <div key={index} className="flex justify-between bg-white p-2 rounded border">
              <div>
                <span className="bg-blue-100 px-1 rounded">{edge.source}</span>
                <span className="mx-2">→</span>
                <span className="bg-green-100 px-1 rounded">{edge.target}</span>
              </div>
              <button 
                onClick={() => removeEdge(edge.source, edge.target)} 
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SequenceConnections;