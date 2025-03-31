// src/components/studio/exportImport/ExportImport.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { FileService } from "@/services/FileService";
import { useAppStore } from "@/modules/store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Enhanced Confirmation Modal Component
interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-primary gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <div className="py-2">
          <p className="mb-2">{message}</p>

          <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will modify your workspaces and scenarios. Make sure you have a backup before proceeding.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// Main ExportImport Component
export const ExportImport: React.FC = () => {
  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importType, setImportType] = useState<"new-workspace" | "existing-workspace">("new-workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  
  // Export states
  const [exportType, setExportType] = useState<"all" | "current-scenario">("all");
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");
  
  // Get app state
  const state = useAppStore();
  const workspaces = state.items;
  const currentWorkspaceId = state.selected.workspace;
  const currentScenarioId = state.selected.scenario;
  
  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportFile(e.target.files?.[0] || null);
  };
  
  // Export function
  const handleExport = () => {
    try {
      if (exportType === "all") {
        // Export all workspaces and settings in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            "state": {
              "items": state.items,
              "selected": state.selected,
              "stateVersion": state.stateVersion,
              "flowSession": {
                "isPlaying": false,
                "currentStepIndex": 0,
                "temporarySteps": []
              }
            },
            "version": 1
          }
        };
        FileService.exportDataToFile(exportData);
      } else {
        // Export only current scenario
        const currentWorkspace = state.items.find(w => w.id === currentWorkspaceId);
        if (!currentWorkspace) {
          setImportError("No workspace selected");
          return;
        }
        
        const currentScenario = currentWorkspace.children.find(s => s.id === currentScenarioId);
        if (!currentScenario) {
          setImportError("No scenario selected");
          return;
        }
        
        // Create a new workspace with only the selected scenario
        const exportWorkspace = {
          ...currentWorkspace,
          children: [currentScenario]
        };
        
        // Export in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            "state": {
              "items": [exportWorkspace],
              "selected": {
                workspace: exportWorkspace.id,
                scenario: currentScenario.id,
                node: ""
              },
              "stateVersion": state.stateVersion,
              "flowSession": {
                "isPlaying": false,
                "currentStepIndex": 0,
                "temporarySteps": []
              }
            },
            "version": 1
          }
        };
        
        FileService.exportDataToFile(exportData);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setImportError("Export failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Import function
  const handleImport = async () => {
    try {
      setImportError(null);
      setImportSuccess(false);
      
      if (!importFile) {
        setImportError("Please select a file to import");
        return;
      }
      
      const importData = await FileService.readDataFromFile(importFile);
      
      // Validate imported data - handle both direct format and nested format
      let itemsData;
      
      // Check if data is in nested format (flowchart-app-state.state.items)
      if (importData["flowchart-app-state"] && importData["flowchart-app-state"].state && importData["flowchart-app-state"].state.items) {
        itemsData = importData["flowchart-app-state"].state.items;
      } 
      // Check if data is in direct format (items)
      else if (importData.items) {
        itemsData = importData.items;
      }
      
      if (!itemsData || !Array.isArray(itemsData)) {
        setImportError("Invalid import file: missing or invalid 'items' property");
        return;
      }
      
      // Handle import based on selected method
      if (importType === "new-workspace") {
        // Confirm before importing as new workspace
        setConfirmationTitle("Import as New Workspace");
        setConfirmationMessage("This will add all imported workspaces to your list. Continue?");
        setConfirmationAction(() => () => {
          // Add imported workspaces with new IDs to prevent conflicts
          const currentTime = Date.now();
          
          // Get the appropriate items array based on structure
          const itemsToImport = importData["flowchart-app-state"]?.state?.items || importData.items;
          
          const newWorkspaces = itemsToImport.map((workspace: any) => ({
            ...workspace,
            id: `workspace-${currentTime}-${Math.floor(Math.random() * 10000)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            children: workspace.children.map((scenario: any) => ({
              ...scenario,
              id: `scenario-${currentTime}-${Math.floor(Math.random() * 10000)}`
            }))
          }));
          
          // Get current state from localStorage to ensure we're working with the latest data
          const currentStateStr = localStorage.getItem('flowchart-app-state');
          let currentState;
          
          try {
            currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
          } catch (e) {
            console.error("Failed to parse current state:", e);
            currentState = null;
          }
          
          // Use the parsed state or fall back to the current state from the store
          const baseState = currentState?.state || {
            items: state.items,
            selected: state.selected,
            stateVersion: state.stateVersion
          };
          
          // Add new workspaces to existing ones
          const updatedState = {
            ...baseState,
            items: [...baseState.items, ...newWorkspaces],
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          // Update local storage directly
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setImportSuccess(true);
          setImportFile(null);
          
          // Reset file input
          const fileInput = document.getElementById("import-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        });
        setShowConfirmation(true);
      } else {
        // Add scenarios to existing workspace
        if (!selectedWorkspaceId) {
          setImportError("Please select a workspace to import scenarios into");
          return;
        }
        
        // Find the selected workspace
        const targetWorkspace = state.items.find(w => w.id === selectedWorkspaceId);
        if (!targetWorkspace) {
          setImportError("Selected workspace not found");
          return;
        }
        
        // Get the appropriate items array based on structure
        const itemsToImport = importData["flowchart-app-state"]?.state?.items || importData.items;
        
        // Make sure imported data has at least one workspace with scenarios
        if (itemsToImport.length === 0 || !itemsToImport[0].children) {
          setImportError("No scenarios found in import file");
          return;
        }
        
        // Get all scenarios from all workspaces in the import
        const allImportedScenarios = itemsToImport.flatMap((workspace: any) => 
          workspace.children || []);
        
        if (allImportedScenarios.length === 0) {
          setImportError("No scenarios found in import file");
          return;
        }
        
        // Confirm before adding scenarios to existing workspace
        setConfirmationTitle("Import to Existing Workspace");
        setConfirmationMessage(`This will add ${allImportedScenarios.length} scenarios to the workspace "${targetWorkspace.title}". Continue?`);
        setConfirmationAction(() => () => {
          // Generate new IDs for imported scenarios
          const currentTime = Date.now();
          const newScenarios = allImportedScenarios.map((scenario: any) => ({
            ...scenario,
            id: `scenario-${currentTime}-${Math.floor(Math.random() * 10000)}`
          }));
          
          // Get current state from localStorage to ensure we're working with the latest data
          const currentStateStr = localStorage.getItem('flowchart-app-state');
          let currentState;
          
          try {
            currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
          } catch (e) {
            console.error("Failed to parse current state:", e);
            currentState = null;
          }
          
          // Use the parsed state or fall back to the current state from the store
          const baseState = currentState?.state || state;
          
          // Create a deep copy of the current items
          const updatedWorkspaces = JSON.parse(JSON.stringify(baseState.items || []));
          
          // Find the target workspace and append the new scenarios
          const targetWorkspaceIndex = updatedWorkspaces.findIndex((w: any) => w.id === selectedWorkspaceId);
          
          if (targetWorkspaceIndex !== -1) {
            // Ensure workspace has children array
            if (!updatedWorkspaces[targetWorkspaceIndex].children) {
              updatedWorkspaces[targetWorkspaceIndex].children = [];
            }
            
            // Add new scenarios to the workspace
            updatedWorkspaces[targetWorkspaceIndex].children = [
              ...updatedWorkspaces[targetWorkspaceIndex].children,
              ...newScenarios
            ];
            
            // Update timestamp
            updatedWorkspaces[targetWorkspaceIndex].updatedAt = Date.now();
          }
          
          // Update local storage with the new state
          const updatedState = {
            ...baseState,
            items: updatedWorkspaces,
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setImportSuccess(true);
          setImportFile(null);
          
          // Reset file input
          const fileInput = document.getElementById("import-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        });
        setShowConfirmation(true);
      }
    } catch (error) {
      setImportError("Failed to import: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <RadioGroup
                  value={exportType}
                  onValueChange={(value) => setExportType(value as "all" | "current-scenario")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="all" id="export-all" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="export-all" className="font-medium">
                        Export all workspaces
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Export all workspaces with all scenarios, nodes, and edges
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="current-scenario" id="export-current" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="export-current" className="font-medium">
                        Export current scenario only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Export only the currently selected scenario with its nodes and edges
                      </p>
                      {(exportType === "current-scenario" && (!currentWorkspaceId || !currentScenarioId)) && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Please select a workspace and scenario first
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardHeader>
            </Card>
            
            <Button
              onClick={handleExport}
              disabled={exportType === "current-scenario" && (!currentWorkspaceId || !currentScenarioId)}
              className="mt-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </TabsContent>

          {/* IMPORT TAB */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <RadioGroup
                  value={importType}
                  onValueChange={(value) => setImportType(value as "new-workspace" | "existing-workspace")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="new-workspace" id="import-new" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="import-new" className="font-medium">
                        Import as new workspace(s)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add imported workspaces separately from existing ones
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="existing-workspace" id="import-existing" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="import-existing" className="font-medium">
                        Import scenarios to existing workspace
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add imported scenarios to one of your existing workspaces
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                {importType === "existing-workspace" && (
                  <div className="mt-4">
                    <Label htmlFor="workspace-select" className="mb-2 block text-sm font-medium">
                      Select target workspace
                    </Label>
                    <Select
                      value={selectedWorkspaceId}
                      onValueChange={setSelectedWorkspaceId}
                    >
                      <SelectTrigger id="workspace-select" className="w-full">
                        <SelectValue placeholder="Select a workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
            </Card>

            <div className="mt-4">
              <Label htmlFor="import-file" className="text-sm font-medium mb-2 block">
                Select JSON file to import:
              </Label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm file:mr-4 file:py-1 file:px-3
                  file:rounded-md file:border-0 file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>

            {importError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 mt-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Data imported successfully. Please refresh the page to see changes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleImport}
                disabled={!importFile || (importType === "existing-workspace" && !selectedWorkspaceId)}
                className="mt-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>

              {importSuccess && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          title={confirmationTitle}
          message={confirmationMessage}
          onConfirm={() => {
            confirmationAction();
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default ExportImport;