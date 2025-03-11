// src/modules/scenarios_module/ScenarioManagement.tsx
import React, { useState } from "react";
import { useScenarioStore } from "./scenarioStore";
import { useScenariosMultiStore } from "./scenariosMultiStore";
import ScenarioList from "./ScenarioList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, FileDown, AlertTriangle } from "lucide-react";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

const ScenarioManagement: React.FC = () => {
  const { nodes, edges, exportToJson } = useScenarioStore();
  const { importScenario } = useScenariosMultiStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  // Export scenario to JSON file
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

  // Handle file selection
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToImport(file);
      setShowImportConfirmation(true);
    }
  };

  // Import scenario from JSON file and add to scenarios list
  const confirmImport = () => {
    if (fileToImport) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target!.result as string);
          importScenario(data);
          setShowImportModal(false);
          setShowImportConfirmation(false);
          setFileToImport(null);
        } catch (error) {
          console.error("Error importing JSON:", error);
          // Add error handling if needed
        }
      };
      reader.readAsText(fileToImport);
    }
  };

  return (
    <div className="space-y-6">
      <MCard
        title="Current Scenario Stats"
        description="Overview of the current scenario"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm font-medium">Nodes</div>
            <div className="text-2xl font-bold mt-1">
              {Object.keys(nodes).length}
            </div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm font-medium">Connections</div>
            <div className="text-2xl font-bold mt-1">{edges.length}</div>
          </div>
        </div>
      </MCard>

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
            Export the entire scenario including all nodes, connections and categories.
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
            Import a scenario from a JSON file. This will add the scenario to the list, not replace the current one.
          </div>
        </MCard>
      </div>

      {/* Export Dialog */}
      <MDialog
        title="Export Current Scenario"
        description="The scenario will be saved as a JSON file that can be imported later"
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={exportScenarioAsJSON}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        }
      >
        <div className="bg-slate-50 p-4 rounded-md border space-y-2">
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
        </div>
      </MDialog>

      {/* Import Dialog */}
      <MDialog
        title="Import Scenario"
        description="Select a JSON file to add a new scenario"
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-md p-8">
            <div className="space-y-2 text-center">
              <div className="text-slate-500">
                Select a JSON file to import
              </div>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelection}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              Import will add the scenario to the list. Make sure you've exported your changes before importing.
            </div>
          </div>
        </div>
      </MDialog>

      {/* Import Confirmation */}
      <AlertDialog
        open={showImportConfirmation}
        onOpenChange={setShowImportConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will add the imported scenario to the list. It will not replace the current scenario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setFileToImport(null);
                setShowImportConfirmation(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenarioManagement;