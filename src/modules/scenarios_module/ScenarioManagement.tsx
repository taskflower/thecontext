// src/modules/ScenarioManagement.tsx
import React, { useState } from 'react';
import { useGraphStore } from '../graph_module/graphStore';
import { useScenarioStore } from './scenarioStore';


const ScenarioManagement: React.FC = () => {
  const { nodes, edges, exportToJson, importFromJson } = useGraphStore();
  const { scenarios, addScenario, importScenarioAsNode } = useScenarioStore();
  
  // State for various modals and forms
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveSchemaForm, setShowSaveSchemaForm] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<string>('');
  const [mountPoint, setMountPoint] = useState('');
  const [prefix, setPrefix] = useState('');
  const [schemaForm, setSchemaForm] = useState({ name: '', description: '' });

  // Handle importing a scenario
  const handleImportScenario = () => {
    const index = parseInt(selectedScenarioIndex);
    if (!isNaN(index) && scenarios[index] && mountPoint) {
      importScenarioAsNode(index, mountPoint, prefix || 'imported');
      setSelectedScenarioIndex('');
      setMountPoint('');
      setPrefix('');
      setShowImportModal(false);
    }
  };

  // Save current graph as a scenario
  const saveCurrentAsScenario = () => {
    if (schemaForm.name) {
      const newScenario = {
        name: schemaForm.name,
        description: schemaForm.description,
        nodes: { ...nodes },
        edges: [...edges],
      };
      addScenario(newScenario);
      setSchemaForm({ name: '', description: '' });
      setShowSaveSchemaForm(false);
    }
  };

  // Export graph as JSON file
  const exportGraphAsJSON = () => {
    const graphData = exportToJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "graph_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Export scenarios as JSON file
  const exportScenariosAsJSON = () => {
    const scenariosData = useScenarioStore.getState().exportScenariosToJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenariosData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "scenarios_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import graph from JSON file
  const importGraphFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target!.result as string);
          importFromJson(data);
        } catch (error) {
          console.error("Błąd podczas wczytywania pliku JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Import scenarios from JSON file
  const importScenariosFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target!.result as string);
          useScenarioStore.getState().importScenariosFromJson(data);
        } catch (error) {
          console.error("Błąd podczas wczytywania pliku scenariuszy JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-lg border">
      <h2 className="font-bold mb-3">Zarządzanie scenariuszami</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setShowSaveSchemaForm(true)} 
          className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Zapisz bieżący graf jako scenariusz
        </button>
        <button 
          onClick={() => setShowImportModal(true)} 
          className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
        >
          Importuj scenariusz do grafu
        </button>
        <div className="grid grid-cols-2 gap-3 col-span-2">
          <button 
            onClick={exportGraphAsJSON} 
            className="bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
          >
            Eksportuj graf do pliku JSON
          </button>
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={importGraphFromJSON} 
              className="absolute inset-0 opacity-0 w-full cursor-pointer" 
            />
            <button className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700 w-full">
              Wczytaj graf z pliku JSON
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 col-span-2">
          <button 
            onClick={exportScenariosAsJSON} 
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Eksportuj scenariusze do pliku JSON
          </button>
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={importScenariosFromJSON} 
              className="absolute inset-0 opacity-0 w-full cursor-pointer" 
            />
            <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full">
              Wczytaj scenariusze z pliku JSON
            </button>
          </div>
        </div>
      </div>

      {/* Saved scenarios list */}
      {scenarios.length > 0 && (
        <div className="mt-4 bg-white p-3 rounded border">
          <h3 className="font-medium mb-2">Zapisane scenariusze ({scenarios.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scenarios.map((scenario, index) => (
              <div key={index} className="p-2 border rounded bg-gray-50 text-sm">
                <div className="font-medium">{scenario.name}</div>
                {scenario.description && (
                  <div className="text-gray-600 mt-1">{scenario.description}</div>
                )}
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Węzły: {Object.keys(scenario.nodes).length}</span>
                  <span>Połączenia: {scenario.edges.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save scenario form modal */}
      {showSaveSchemaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Zapisz bieżący graf jako scenariusz</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa scenariusza</label>
                <input 
                  value={schemaForm.name} 
                  onChange={(e) => setSchemaForm({ ...schemaForm, name: e.target.value })}
                  placeholder="Nazwa scenariusza" 
                  className="w-full p-2 border rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis (opcjonalnie)</label>
                <textarea 
                  value={schemaForm.description} 
                  onChange={(e) => setSchemaForm({ ...schemaForm, description: e.target.value })}
                  placeholder="Krótki opis scenariusza" 
                  className="w-full p-2 border rounded h-24" 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowSaveSchemaForm(false)} 
                  className="px-4 py-2 border rounded"
                >
                  Anuluj
                </button>
                <button 
                  onClick={saveCurrentAsScenario}
                  disabled={!schemaForm.name} 
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                  Zapisz scenariusz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import scenario modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Importuj scenariusz do grafu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wybierz scenariusz</label>
                <select
                  value={selectedScenarioIndex}
                  onChange={(e) => setSelectedScenarioIndex(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz scenariusz</option>
                  {scenarios.map((scenario, index) => (
                    <option key={index} value={index}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedScenarioIndex !== '' && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium">{scenarios[parseInt(selectedScenarioIndex)].name}</p>
                  {scenarios[parseInt(selectedScenarioIndex)].description && (
                    <p className="text-gray-600 mt-1">{scenarios[parseInt(selectedScenarioIndex)].description}</p>
                  )}
                  <p className="mt-1">
                    Liczba węzłów: {Object.keys(scenarios[parseInt(selectedScenarioIndex)].nodes).length}
                  </p>
                  <p>Liczba połączeń: {scenarios[parseInt(selectedScenarioIndex)].edges.length}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Punkt montowania (węzeł w bieżącym grafie)
                </label>
                <select 
                  value={mountPoint} 
                  onChange={(e) => setMountPoint(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz węzeł</option>
                  {Object.keys(nodes).map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prefiks dla importowanych węzłów
                </label>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="np. sekcja1 (domyślnie: imported)"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowImportModal(false)} 
                  className="px-4 py-2 border rounded"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleImportScenario}
                  disabled={selectedScenarioIndex === '' || !mountPoint}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                  Importuj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioManagement;