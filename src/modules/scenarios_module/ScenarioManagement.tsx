// src/modules/scenarios_module/ScenarioManagement.tsx
import React, { useState } from "react";
import { useScenarioStore } from "./scenarioStore";
import { useScenariosMultiStore } from "./scenariosMultiStore";
import ScenarioList from "./ScenarioList";
import { Button } from "@/components/ui/button";
import { FileUp, FileDown } from "lucide-react";
import MCard from "@/components/MCard";
import { exportToJsonFile, parseJsonFile } from "../shared/jsonUtils";
import JsonExportModal from "../shared/JsonExportModal";
import JsonImportModal from "../shared/JsonImportModal";
import ScenarioStats from "./editor/ScenarioStats";

const ScenarioManagement: React.FC = () => {
  const { nodes, edges, exportToJson } = useScenarioStore();
  const { importScenario, syncCurrentScenarioToActive } =
    useScenariosMultiStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Handle export operation
  const handleExport = () => {
    // Synchronizuj aktywny scenariusz do aktualnego przed eksportem
    useScenariosMultiStore.getState().syncActiveScenarioToCurrent();

    const scenarioData = exportToJson();
    exportToJsonFile(scenarioData, "scenario_export.json");
    setShowExportModal(false);
  };

  // Handle file selection and import
  const handleFileSelect = async (file: File) => {
    try {
      const data = await parseJsonFile(file);

      // Ensure data has the required structure
      if (data && typeof data === "object" && data.nodes) {
        // Add an ID if missing
        if (!data.id) {
          data.id = `scenario_${Date.now()}`;
        }

        // Import the scenario
        importScenario(data);

        // This should now be handled by importScenario automatically
        // but we'll add it as a backup
        setTimeout(() => {
          syncCurrentScenarioToActive();
        }, 100);
      } else {
        alert(
          "Invalid scenario format. The file must contain a 'nodes' property."
        );
      }
    } catch (error) {
      alert(
        "Error importing scenario. Please make sure the file contains valid JSON."
      );
      console.error(error);
    }
  };

  // Export statistics for display
  const exportStats = (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      <div>
        <span className="text-sm font-medium">Nodes:</span>
        <span className="ml-2">{Object.keys(nodes).length}</span>
      </div>
      <div>
        <span className="text-sm font-medium">Connections:</span>
        <span className="ml-2">{edges.length}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ScenarioStats />

      {/* Scenarios List */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Scenarios List</h2>
        <ScenarioList />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MCard
          title="Export Scenario"
          description="Save current scenario as a JSON file"
          footer={
            <Button
              onClick={() => setShowExportModal(true)}
              className="w-full"
              variant="outline"
              disabled={Object.keys(nodes).length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export to JSON
            </Button>
          }
        >
          <div className="text-sm text-slate-500">
            Export the entire scenario including all nodes, connections and
            categories.
          </div>
        </MCard>

        <MCard
          title="Import Scenario"
          description="Load a previously exported scenario"
          footer={
            <Button
              onClick={() => setShowImportModal(true)}
              className="w-full"
              variant="outline"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import from JSON
            </Button>
          }
        >
          <div className="text-sm text-slate-500">
            Import a scenario from a JSON file. This will add the scenario to
            the list, not replace the current one.
          </div>
        </MCard>
      </div>

      {/* Export Modal */}
      <JsonExportModal
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        title="Export Current Scenario"
        description="The scenario will be saved as a JSON file that can be imported later"
        onExport={handleExport}
        statistics={exportStats}
      />

      {/* Import Modal */}
      <JsonImportModal
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
        title="Import Scenario"
        description="Select a JSON file to add a new scenario"
        warningMessage="Import will add the scenario to the list. Make sure you've exported your changes before importing."
        confirmTitle="Add New Scenario?"
        confirmDescription="This action will add the imported scenario to the list. It will not replace the current scenario."
        onFileSelect={handleFileSelect}
      />
    </div>
  );
};

export default ScenarioManagement;
