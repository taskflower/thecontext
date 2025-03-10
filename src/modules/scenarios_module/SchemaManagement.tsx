// src/modules/scenario_module/SchemaManagement.tsx
// (dawniej SchemaManagement.tsx)
import React, { useState } from "react";
import { useScenarioStore } from "./scenarioStore";


// Komponent SchemaManagement został zmodyfikowany, aby koncentrować się tylko na
// schematach scenariusza
const SchemaManagement = () => {
  const { nodes, edges, exportToJson, importFromJson } = useScenarioStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Export scenario as JSON file
  const exportScenarioAsJSON = () => {
    const scenarioData = exportToJson();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(scenarioData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "scenario_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowExportModal(false);
  };

  // Import scenario from JSON file
  const importScenarioFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <h2 className="font-bold mb-3">Zarządzanie schematami scenariusza</h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
        >
          Eksportuj scenariusz do pliku JSON
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700"
        >
          Wczytaj scenariusz z pliku JSON
        </button>
      </div>

      {/* Informacje o bieżącym scenariuszu */}
      <div className="mt-4 bg-white p-3 rounded border">
        <h3 className="font-medium mb-2">Bieżący scenariusz</h3>
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

      {/* Modal eksportu scenariusza */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Eksportuj bieżący scenariusz</h3>
            <div className="mb-4">
              <p>
                Scenariusz zostanie zapisany jako plik JSON, który można później
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
                onClick={exportScenarioAsJSON}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Eksportuj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal importu scenariusza */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Importuj scenariusz z pliku JSON
            </h3>
            <div className="mb-4">
              <p className="mb-2">
                Wybierz plik JSON z zapisanym wcześniej scenariuszem.
              </p>
              <p className="text-red-500 text-sm">
                Uwaga: Importowanie zastąpi aktualny scenariusz!
              </p>
              <div className="mt-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={importScenarioFromJSON}
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