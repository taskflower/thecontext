/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/SchemaManagement.tsx
import React, { useState } from "react";
import { useGraphStore } from "./graphStore";

// Komponent SchemaManagement został zmodyfikowany, aby koncentrować się tylko na
// schematach grafu (niezwiązanych ze scenariuszami, które teraz są w ScenarioManagement)
const SchemaManagement = () => {
  const { nodes, edges, exportToJson, importFromJson } = useGraphStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Export graph as JSON file
  const exportGraphAsJSON = () => {
    const graphData = exportToJson();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(graphData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "graph_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowExportModal(false);
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
          setShowImportModal(false);
        } catch (error) {
          console.error("Błąd podczas wczytywania pliku JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-lg border">
      <h2 className="font-bold mb-3">Zarządzanie schematami grafu</h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
        >
          Eksportuj graf do pliku JSON
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700"
        >
          Wczytaj graf z pliku JSON
        </button>
      </div>

      {/* Informacje o bieżącym grafie */}
      <div className="mt-4 bg-white p-3 rounded border">
        <h3 className="font-medium mb-2">Bieżący graf</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-medium">Liczba węzłów:</span>{" "}
            {Object.keys(nodes).length}
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-medium">Liczba połączeń:</span> {edges.length}
          </div>
        </div>
      </div>

      {/* Modal eksportu grafu */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Eksportuj bieżący graf</h3>
            <div className="mb-4">
              <p>
                Graf zostanie zapisany jako plik JSON, który można później
                zaimportować.
              </p>
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p>
                  <strong>Liczba węzłów:</strong> {Object.keys(nodes).length}
                </p>
                <p>
                  <strong>Liczba połączeń:</strong> {edges.length}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border rounded"
              >
                Anuluj
              </button>
              <button
                onClick={exportGraphAsJSON}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Eksportuj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal importu grafu */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Importuj graf z pliku JSON
            </h3>
            <div className="mb-4">
              <p className="mb-2">
                Wybierz plik JSON z zapisanym wcześniej grafem.
              </p>
              <p className="text-red-500 text-sm">
                Uwaga: Importowanie zastąpi aktualny graf!
              </p>
              <div className="mt-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={importGraphFromJSON}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border rounded"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaManagement;
