// src/modules/scenarios_module/SchemaManagement.tsx
import React, { useState } from "react";
import { useScenarioStore } from "./scenarioStore";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { FileUpIcon, FileDownIcon, AlertTriangleIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui";

const SchemaManagement: React.FC = () => {
  const { nodes, edges, exportToJson, importFromJson } = useScenarioStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  // Export scenario as JSON file
  const exportScenarioAsJSON = () => {
    const scenarioData = exportToJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarioData, null, 2));
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

  // Import scenario from JSON file
  const confirmImport = () => {
    if (fileToImport) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target!.result as string);
          importFromJson(data);
          setShowImportModal(false);
          setShowImportConfirmation(false);
          setFileToImport(null);
        } catch (error) {
          console.error("Error importing JSON file:", error);
          // Could add error handling here
        }
      };
      reader.readAsText(fileToImport);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Scenario</CardTitle>
            <CardDescription>
              Save your current scenario as a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-slate-500">
              Export your entire scenario including all nodes, connections, and categories.
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setShowExportModal(true)}
              className="w-full"
              variant="outline"
              disabled={Object.keys(nodes).length === 0}
            >
              <FileDownIcon className="h-4 w-4 mr-2" />
              Export to JSON
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Import Scenario</CardTitle>
            <CardDescription>
              Load a previously exported scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-slate-500">
              Import a scenario from a JSON file. This will replace your current scenario.
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setShowImportModal(true)}
              className="w-full"
              variant="outline"
            >
              <FileUpIcon className="h-4 w-4 mr-2" />
              Import from JSON
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Scenario Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md border">
              <div className="text-sm font-medium">Nodes</div>
              <div className="text-2xl font-bold mt-1">{Object.keys(nodes).length}</div>
            </div>
            <div className="bg-white p-3 rounded-md border">
              <div className="text-sm font-medium">Connections</div>
              <div className="text-2xl font-bold mt-1">{edges.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Current Scenario</DialogTitle>
            <DialogDescription>
              Your scenario will be saved as a JSON file that you can import later.
            </DialogDescription>
          </DialogHeader>
          
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={exportScenarioAsJSON}>
              <FileDownIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Scenario</DialogTitle>
            <DialogDescription>
              Select a previously exported JSON file to import.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-md p-8">
              <div className="space-y-2 text-center">
                <div className="text-slate-500">Choose a JSON file to import</div>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelection}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <FileUpIcon className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                Importing will replace your current scenario. Make sure to export your work first if needed.
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Confirmation */}
      <AlertDialog open={showImportConfirmation} onOpenChange={setShowImportConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Current Scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will replace your current scenario with the imported one. 
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setFileToImport(null);
              setShowImportConfirmation(false);
            }}>
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

export default SchemaManagement;