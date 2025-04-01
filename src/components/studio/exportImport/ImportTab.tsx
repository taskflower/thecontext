/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/exportImport/tabs/ImportTab.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, RefreshCw, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileService } from "@/services/FileService";
import { Edge } from "reactflow";
import { Scenario } from "@/modules/scenarios";
import { ContextItem } from "@/services/PluginAuthAdapter";

interface ImportTabProps {
  workspaces: any[];
  showConfirmation: (title: string, message: string, action: () => void) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({ workspaces, showConfirmation }) => {
  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importType, setImportType] = useState<"new-workspace" | "existing-workspace">("new-workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportFile(e.target.files?.[0] || null);
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

      // Debug information about import file
      console.log("Import file diagnostics:", {
        hasFlowchartState: Boolean(importData["flowchart-app-state"]),
        hasState: Boolean(importData["flowchart-app-state"]?.state),
        hasItems: Boolean(importData["flowchart-app-state"]?.state?.items),
        hasContextItems: Boolean(
          importData["flowchart-app-state"]?.state?.contextItems
        ),
        contextItemsCount:
          importData["flowchart-app-state"]?.state?.contextItems?.length || 0,
      });

      // Validate imported data - handle both direct format and nested format
      let itemsData;

      // Check if data is in nested format (flowchart-app-state.state.items)
      if (
        importData["flowchart-app-state"] &&
        importData["flowchart-app-state"].state &&
        importData["flowchart-app-state"].state.items
      ) {
        itemsData = importData["flowchart-app-state"].state.items;
      }
      // Check if data is in direct format (items)
      else if (importData.items) {
        itemsData = importData.items;
      }

      if (!itemsData || !Array.isArray(itemsData)) {
        setImportError(
          "Invalid import file: missing or invalid 'items' property"
        );
        return;
      }

      // Get all scenarios from imported workspaces
      const scenarios = itemsData.flatMap(
        (w: any) => w.children || []
      ) || [];

      // Check for filters in the import
      const filtersCount = scenarios.reduce((count: number, scenario: any) => {
        return count + (scenario.filters?.length || 0);
      }, 0);

      console.log("Import file filters diagnostics:", {
        scenariosCount: scenarios.length,
        scenariosWithFilters: scenarios.filter(
          (s: any) => s.filters?.length > 0
        ).length,
        totalFiltersCount: filtersCount,
        sampleFilters: scenarios[0]?.filters || [],
      });

      // Handle import based on selected method
      if (importType === "new-workspace") {
        // Confirm before importing as new workspace
        showConfirmation(
          "Import as New Workspace",
          "This will add all imported workspaces to your list. Continue?",
          () => handleImportAsNewWorkspace(importData)
        );
      } else {
        // Add scenarios to existing workspace
        if (!selectedWorkspaceId) {
          setImportError("Please select a workspace to import scenarios into");
          return;
        }

        // Find the selected workspace
        const targetWorkspace = workspaces.find(
          (w) => w.id === selectedWorkspaceId
        );
        if (!targetWorkspace) {
          setImportError("Selected workspace not found");
          return;
        }

        // Get the appropriate items array based on structure
        const itemsToImport =
          importData["flowchart-app-state"]?.state?.items || importData.items;

        // Make sure imported data has at least one workspace with scenarios
        if (itemsToImport.length === 0 || !itemsToImport[0].children) {
          setImportError("No scenarios found in import file");
          return;
        }

        // Get all scenarios from all workspaces in the import
        const allImportedScenarios = itemsToImport.flatMap(
          (workspace: any) => workspace.children || []
        );

        if (allImportedScenarios.length === 0) {
          setImportError("No scenarios found in import file");
          return;
        }

        // Confirm before adding scenarios to existing workspace
        showConfirmation(
          "Import to Existing Workspace",
          `This will add ${allImportedScenarios.length} scenarios to the workspace "${targetWorkspace.title}". Continue?`,
          () => handleImportToExistingWorkspace(importData, targetWorkspace)
        );
      }
    } catch (error) {
      setImportError(
        "Failed to import: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  // Handle import as new workspace
  const handleImportAsNewWorkspace = (importData: any) => {
    // Add imported workspaces with new IDs to prevent conflicts
    const currentTime = Date.now();

    // Get the appropriate items array based on structure
    const itemsToImport =
      importData["flowchart-app-state"]?.state?.items || importData.items;

    // Track ID mappings for cross-references
    const idMapping: { [key: string]: string } = {};

    const newWorkspaces = itemsToImport.map((workspace: any) => {
      // Create new workspace ID
      const newWorkspaceId = `workspace-${currentTime}-${Math.floor(
        Math.random() * 10000
      )}`;

      // Store mapping
      idMapping[workspace.id] = newWorkspaceId;

      return {
        ...workspace,
        id: newWorkspaceId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        children: workspace.children?.map((scenario: any) => {
          // Create new scenario ID
          const newScenarioId = `scenario-${currentTime}-${Math.floor(
            Math.random() * 10000
          )}`;

          // Store mapping
          idMapping[scenario.id] = newScenarioId;

          // Create new scenario with preserved properties
          const newScenario = {
            ...scenario,
            id: newScenarioId,
            // Preserve filters
            filters: scenario.filters
              ? scenario.filters.map((filter: any) => ({
                  ...filter,
                  id: `filter-${currentTime}-${Math.floor(
                    Math.random() * 10000
                  )}`,
                }))
              : [],
            // Preserve context
            context: scenario.context,
            // Ensure edges property exists
            edges: scenario.edges || [],
          };

          // First, assign new IDs to all children (nodes)
          if (newScenario.children && newScenario.children.length > 0) {
            const nodeIdMap: { [key: string]: string } = {}; // Map old node IDs to new node IDs

            newScenario.children = newScenario.children.map(
              (node: { id: string }) => {
                const oldNodeId = node.id;
                const newNodeId = `node-${currentTime}-${Math.floor(
                  Math.random() * 10000
                )}`;

                // Store mapping
                nodeIdMap[oldNodeId] = newNodeId;

                // Return node with new ID
                return {
                  ...node,
                  id: newNodeId,
                };
              }
            );

            // Update any existing edges with the new node IDs
            if (newScenario.edges && newScenario.edges.length > 0) {
              newScenario.edges = newScenario.edges.map((edge: Edge) => ({
                ...edge,
                id: `edge-${currentTime}-${Math.floor(
                  Math.random() * 10000
                )}`,
                source: nodeIdMap[edge.source] || edge.source,
                target: nodeIdMap[edge.target] || edge.target,
              }));
            }

            // ALWAYS create edges connecting nodes sequentially to ensure proper flow
            console.log(
              `Creating sequential edges for scenario ${newScenarioId} with ${newScenario.children.length} nodes`
            );

            // Create or replace edges connecting nodes in sequence
            newScenario.edges = [];
            for (let i = 0; i < newScenario.children.length - 1; i++) {
              const sourceNode = newScenario.children[i];
              const targetNode = newScenario.children[i + 1];

              if (sourceNode && targetNode) {
                newScenario.edges.push({
                  id: `edge-${currentTime}-${i}-${Math.floor(
                    Math.random() * 10000
                  )}`,
                  source: sourceNode.id,
                  target: targetNode.id,
                  type: "edge",
                });
              }
            }
          }

          return newScenario;
        }) || [],
      };
    });

    // Get current state from localStorage to ensure we're working with the latest data
    const currentStateStr = localStorage.getItem("flowchart-app-state");
    let currentState;

    try {
      currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
    } catch (e) {
      console.error("Failed to parse current state:", e);
      currentState = null;
    }

    // Use the parsed state or fall back to the current state from the store
    const baseState = currentState?.state || {
      items: workspaces,
      stateVersion: currentState?.state?.stateVersion || 0,
      selected: currentState?.state?.selected || {},
    };

    // Get any context items from the import - check both locations
    const rootContextItems =
      importData["flowchart-app-state"]?.state?.contextItems || [];

    // Also look for context items in each workspace
    const workspaceContextItems: ContextItem[] = [];
    const importedWorkspaces =
      importData["flowchart-app-state"]?.state?.items || [];

    // Gather context items from workspaces
    importedWorkspaces.forEach((workspace: any) => {
      if (
        workspace.contextItems &&
        Array.isArray(workspace.contextItems)
      ) {
        console.log(
          `Import found ${workspace.contextItems.length} context items in workspace ${workspace.title}`
        );
        workspaceContextItems.push(...workspace.contextItems);
      }
    });

    // Combine all found context items
    const allContextItemsToImport = [
      ...rootContextItems,
      ...workspaceContextItems,
    ];
    
    // Remap scenario IDs in context items
    const updatedContextItems = allContextItemsToImport.map(
      (contextItem: any) => {
        // Create a new ID for the context item
        const newContextId = `context-${currentTime}-${Math.floor(
          Math.random() * 10000
        )}`;

        // If the context item has a scenarioId, update it with the new ID
        let updatedScenarioId = contextItem.scenarioId;
        if (updatedScenarioId && idMapping[updatedScenarioId]) {
          updatedScenarioId = idMapping[updatedScenarioId];
        }

        return {
          ...contextItem,
          id: newContextId,
          scenarioId: updatedScenarioId,
        };
      }
    );

    // Add context items to the new workspaces
    for (const workspace of newWorkspaces) {
      // Initialize contextItems array if it doesn't exist
      if (!workspace.contextItems) {
        workspace.contextItems = [];
      }

      // Add context items associated with this workspace's scenarios
      const contextItemsForWorkspace = updatedContextItems.filter(
        (item) => {
          // If item has no scenarioId, it's a global context
          if (!item.scenarioId) return true;

          // Otherwise check if this workspace has the scenario
          return workspace.children?.some(
            (scenario: Scenario) => scenario.id === item.scenarioId
          ) || false;
        }
      );

      // Add the context items to the workspace
      if (contextItemsForWorkspace.length > 0) {
        workspace.contextItems = [
          ...workspace.contextItems,
          ...contextItemsForWorkspace,
        ];

        // Validate and fix context items
        for (const item of workspace.contextItems) {
          if (!item.createdAt) item.createdAt = Date.now(); // Fix missing timestamp
          if (!item.updatedAt) item.updatedAt = Date.now(); // Fix missing timestamp
        }
      }
    }

    // Add new workspaces to existing ones
    const updatedState = {
      ...baseState,
      items: [...baseState.items, ...newWorkspaces],
      stateVersion: (baseState.stateVersion || 0) + 1,
    };

    // Format in the same structure as the original
    const storageData = {
      state: updatedState,
      version: currentState?.version || 1,
    };

    // Update local storage directly
    localStorage.setItem(
      "flowchart-app-state",
      JSON.stringify(storageData)
    );

    setImportSuccess(true);
    setImportFile(null);

    // Reset file input
    const fileInput = document.getElementById(
      "import-file"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Handle import to existing workspace
  const handleImportToExistingWorkspace = (importData: any, targetWorkspace: any) => {
    const currentTime = Date.now();
    const idMapping: { [key: string]: string } = {}; // To track old ID to new ID mapping

    // Get the appropriate items array based on structure
    const itemsToImport =
      importData["flowchart-app-state"]?.state?.items || importData.items;

    // Get all scenarios from all workspaces in the import
    const allImportedScenarios = itemsToImport.flatMap(
      (workspace: any) => workspace.children || []
    );

    const newScenarios = allImportedScenarios.map((scenario: any) => {
      // Generate new ID for scenario
      const newScenarioId = `scenario-${currentTime}-${Math.floor(
        Math.random() * 10000
      )}`;

      // Store mapping from old to new ID
      idMapping[scenario.id] = newScenarioId;

      // Create the new scenario with all properties
      const newScenario = {
        ...scenario,
        id: newScenarioId,
        // If filters exist, preserve them
        filters: scenario.filters
          ? scenario.filters.map((filter: any) => ({
              ...filter,
              id: `filter-${currentTime}-${Math.floor(
                Math.random() * 10000
              )}`,
            }))
          : [],
        // Preserve context references
        context: scenario.context,
        // Ensure edges property exists
        edges: scenario.edges || [],
      };

      // First, assign new IDs to all children (nodes)
      if (newScenario.children && newScenario.children.length > 0) {
        const nodeIdMap: { [key: string]: string } = {}; // Map old node IDs to new node IDs

        newScenario.children = newScenario.children.map((node: any) => {
          const oldNodeId = node.id;
          const newNodeId = `node-${currentTime}-${Math.floor(
            Math.random() * 10000
          )}`;

          // Store mapping
          nodeIdMap[oldNodeId] = newNodeId;

          // Return node with new ID
          return {
            ...node,
            id: newNodeId,
          };
        });

        // Update any existing edges with the new node IDs
        if (newScenario.edges && newScenario.edges.length > 0) {
          newScenario.edges = newScenario.edges.map((edge: Edge) => ({
            ...edge,
            id: `edge-${currentTime}-${Math.floor(
              Math.random() * 10000
            )}`,
            source: nodeIdMap[edge.source] || edge.source,
            target: nodeIdMap[edge.target] || edge.target,
          }));
        }

        // Create sequential edges
        newScenario.edges = [];
        for (let i = 0; i < newScenario.children.length - 1; i++) {
          const sourceNode = newScenario.children[i];
          const targetNode = newScenario.children[i + 1];

          if (sourceNode && targetNode) {
            newScenario.edges.push({
              id: `edge-${currentTime}-${i}-${Math.floor(
                Math.random() * 10000
              )}`,
              source: sourceNode.id,
              target: targetNode.id,
              type: "edge",
            });
          }
        }
      }

      return newScenario;
    });

    // Get current state from localStorage to ensure we're working with the latest data
    const currentStateStr = localStorage.getItem("flowchart-app-state");
    let currentState;

    try {
      currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
    } catch (e) {
      console.error("Failed to parse current state:", e);
      currentState = null;
    }

    // Use the parsed state or fall back to the current state from the store
    const baseState = currentState?.state || {
      items: workspaces,
      stateVersion: currentState?.state?.stateVersion || 0,
      selected: currentState?.state?.selected || {},
    };

    // Create a deep copy of the current items
    const updatedWorkspaces = JSON.parse(
      JSON.stringify(baseState.items || [])
    );

    // Find the target workspace and append the new scenarios
    const targetWorkspaceIndex = updatedWorkspaces.findIndex(
      (w: any) => w.id === targetWorkspace.id
    );

    if (targetWorkspaceIndex !== -1) {
      // Ensure workspace has children array
      if (!updatedWorkspaces[targetWorkspaceIndex].children) {
        updatedWorkspaces[targetWorkspaceIndex].children = [];
      }

      // Add new scenarios to the workspace
      updatedWorkspaces[targetWorkspaceIndex].children = [
        ...updatedWorkspaces[targetWorkspaceIndex].children,
        ...newScenarios,
      ];

      // Update timestamp
      updatedWorkspaces[targetWorkspaceIndex].updatedAt = Date.now();
    }

    // Get any context items from the import - check both locations
    const rootContextItems =
      importData["flowchart-app-state"]?.state?.contextItems || [];

    // Also look for context items in each workspace
    const workspaceContextItems: ContextItem[] = [];
    const importedWorkspaces =
      importData["flowchart-app-state"]?.state?.items || [];

    // Gather context items from workspaces
    importedWorkspaces.forEach((workspace: any) => {
      if (
        workspace.contextItems &&
        Array.isArray(workspace.contextItems)
      ) {
        workspaceContextItems.push(...workspace.contextItems);
      }
    });

    // Combine all found context items
    const allContextItemsToImport = [
      ...rootContextItems,
      ...workspaceContextItems,
    ];

    // Remap scenario IDs in context items
    const updatedContextItems = allContextItemsToImport.map(
      (contextItem: any) => {
        // Create a new ID for the context item
        const newContextId = `context-${currentTime}-${Math.floor(
          Math.random() * 10000
        )}`;

        // If the context item has a scenarioId, update it with the new ID
        let updatedScenarioId = contextItem.scenarioId;
        if (updatedScenarioId && idMapping[updatedScenarioId]) {
          updatedScenarioId = idMapping[updatedScenarioId];
        }

        return {
          ...contextItem,
          id: newContextId,
          scenarioId: updatedScenarioId,
        };
      }
    );

    // Now add context items to the appropriate workspace
    if (targetWorkspaceIndex !== -1) {
      // Initialize contextItems array if it doesn't exist
      if (!updatedWorkspaces[targetWorkspaceIndex].contextItems) {
        updatedWorkspaces[targetWorkspaceIndex].contextItems = [];
      }

      // Add the context items to the workspace
      updatedWorkspaces[targetWorkspaceIndex].contextItems = [
        ...updatedWorkspaces[targetWorkspaceIndex].contextItems,
        ...updatedContextItems,
      ];

      // Validate context items have all required properties
      for (const item of updatedWorkspaces[targetWorkspaceIndex].contextItems) {
        if (!item.createdAt) item.createdAt = Date.now(); // Fix missing timestamp
        if (!item.updatedAt) item.updatedAt = Date.now(); // Fix missing timestamp
      }
    }

    // Update local storage with the new state
    const updatedState = {
      ...baseState,
      items: updatedWorkspaces,
      stateVersion: (baseState.stateVersion || 0) + 1,
    };

    // Format in the same structure as the original
    const storageData = {
      state: updatedState,
      version: currentState?.version || 1,
    };

    localStorage.setItem(
      "flowchart-app-state",
      JSON.stringify(storageData)
    );

    setImportSuccess(true);
    setImportFile(null);

    // Reset file input
    const fileInput = document.getElementById(
      "import-file"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <RadioGroup
            value={importType}
            onValueChange={(value) =>
              setImportType(
                value as "new-workspace" | "existing-workspace"
              )
            }
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
              <RadioGroupItem
                value="existing-workspace"
                id="import-existing"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="import-existing" className="font-medium">
                  Import scenarios to existing workspace
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add imported scenarios to one of your existing
                  workspaces
                </p>
              </div>
            </div>
          </RadioGroup>

          {importType === "existing-workspace" && (
            <div className="mt-4">
              <Label
                htmlFor="workspace-select"
                className="mb-2 block text-sm font-medium"
              >
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
        <Label
          htmlFor="import-file"
          className="text-sm font-medium mb-2 block"
        >
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
            Data imported successfully. Please refresh the page to see
            changes.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleImport}
          disabled={
            !importFile ||
            (importType === "existing-workspace" && !selectedWorkspaceId)
          }
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
    </>
  );
};