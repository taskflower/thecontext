/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/SchemaManagement.tsx
import React, { useState } from 'react';
import { useGraphStore } from './graphStore';


const SchemaManagement = () => {
  const {
    nodes,
    edges,
    savedSchemas,
    addSchema,
    exportToJson,
    importFromJson,
  } = useGraphStore();

  const [schemaForm, setSchemaForm] = useState({ name: '', description: '' });
  const [showSaveSchemaForm, setShowSaveSchemaForm] = useState(false);
  const [showImportSchemaForm, setShowImportSchemaForm] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [mountPoint, setMountPoint] = useState('');
  const [prefixForm, setPrefixForm] = useState('');

  const saveCurrentAsSchema = () => {
    if (schemaForm.name) {
      const newSchema = {
        name: schemaForm.name,
        description: schemaForm.description,
        nodes: { ...nodes },
        edges: [...edges],
      };
      addSchema(newSchema);
      setSchemaForm({ name: '', description: '' });
      setShowSaveSchemaForm(false);
    }
  };

  const importSchema = () => {
    if (selectedSchema && mountPoint) {
      const prefix = prefixForm || 'imported';
      const importedNodes: Record<string, any> = {};
      Object.entries(selectedSchema.nodes).forEach(([id, node]: [string, any]) => {
        const newId = `${prefix}.${node.id}`;
        importedNodes[newId] = { ...node, id: newId };
      });
      const importedEdges = selectedSchema.edges.map((edge: any) => ({
        source: `${prefix}.${edge.source}`,
        target: `${prefix}.${edge.target}`,
      }));
      const startNodeIds = Object.keys(selectedSchema.nodes).filter(
        id => !selectedSchema.edges.some((edge: any) => edge.target === id)
      );
      if (startNodeIds.length > 0) {
        importedEdges.push({
          source: mountPoint,
          target: `${prefix}.${startNodeIds[0]}`,
        });
      }
      // Aktualizacja stanu store poprzez scalanie obecnych i importowanych danych
      useGraphStore.setState({
        nodes: { ...nodes, ...importedNodes },
        edges: [...edges, ...importedEdges],
      });
      setSelectedSchema(null);
      setMountPoint('');
      setPrefixForm('');
      setShowImportSchemaForm(false);
    }
  };

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

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-lg border">
      <h2 className="font-bold mb-3">Zarządzanie schematami</h2>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShowSaveSchemaForm(true)} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          Zapisz bieżący graf jako schemat
        </button>
        <button onClick={() => setShowImportSchemaForm(true)} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
          Importuj schemat do grafu
        </button>
        <button onClick={exportGraphAsJSON} className="bg-teal-600 text-white p-2 rounded hover:bg-teal-700">
          Eksportuj graf do pliku JSON
        </button>
        <div className="relative">
          <input type="file" accept=".json" onChange={importGraphFromJSON} className="absolute inset-0 opacity-0 w-full cursor-pointer" />
          <button className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700 w-full">
            Wczytaj graf z pliku JSON
          </button>
        </div>
      </div>

      {showSaveSchemaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Zapisz bieżący graf jako schemat</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa schematu</label>
                <input 
                  value={schemaForm.name} 
                  onChange={(e) => setSchemaForm({ ...schemaForm, name: e.target.value })}
                  placeholder="Nazwa schematu" 
                  className="w-full p-2 border rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis (opcjonalnie)</label>
                <textarea 
                  value={schemaForm.description} 
                  onChange={(e) => setSchemaForm({ ...schemaForm, description: e.target.value })}
                  placeholder="Krótki opis schematu" 
                  className="w-full p-2 border rounded h-24" 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowSaveSchemaForm(false)} className="px-4 py-2 border rounded">
                  Anuluj
                </button>
                <button onClick={saveCurrentAsSchema} disabled={!schemaForm.name} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
                  Zapisz schemat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportSchemaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Importuj schemat do grafu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wybierz schemat</label>
                <select 
                  value={selectedSchema ? savedSchemas.indexOf(selectedSchema) : ""} 
                  onChange={(e) => setSelectedSchema(savedSchemas[parseInt(e.target.value)])}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz schemat</option>
                  {savedSchemas.map((schema, index) => (
                    <option key={index} value={index}>{schema.name}</option>
                  ))}
                </select>
              </div>
              {selectedSchema && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium">{selectedSchema.name}</p>
                  {selectedSchema.description && <p className="text-gray-600 mt-1">{selectedSchema.description}</p>}
                  <p className="mt-1">Liczba węzłów: {Object.keys(selectedSchema.nodes).length}</p>
                  <p>Liczba połączeń: {selectedSchema.edges.length}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Punkt montowania (węzeł w bieżącym grafie)</label>
                <select 
                  value={mountPoint} 
                  onChange={(e) => setMountPoint(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz węzeł</option>
                  {Object.keys(nodes).map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prefiks dla importowanych węzłów</label>
                <input 
                  value={prefixForm} 
                  onChange={(e) => setPrefixForm(e.target.value)}
                  placeholder="np. sekcja1 (domyślnie: imported)" 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowImportSchemaForm(false)} className="px-4 py-2 border rounded">
                  Anuluj
                </button>
                <button onClick={importSchema} disabled={!selectedSchema || !mountPoint} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
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

export default SchemaManagement;
