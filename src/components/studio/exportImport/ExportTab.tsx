/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/exportImport/tabs/ExportTab.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileService } from "@/services/FileService";

interface ExportTabProps {
  state: any;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state }) => {
  const [exportType, setExportType] = useState<"all" | "current-scenario">("all");
  const [exportError, setExportError] = useState<string | null>(null);

  const currentWorkspaceId = state.selected.workspace;
  const currentScenarioId = state.selected.scenario;

  const handleExport = () => {
    try {
      if (exportType === "all") {
        // Export all workspaces and settings in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            state: {
              items: state.items, // Context items are included in each workspace
              selected: state.selected,
              stateVersion: state.stateVersion,
              flowSession: {
                isPlaying: false,
                currentStepIndex: 0,
                temporarySteps: [],
              },
            },
            version: 1,
          },
        };
        FileService.exportDataToFile(exportData);
      } else {
        // Export only current scenario
        const currentWorkspace = state.items.find(
          (w: any) => w.id === currentWorkspaceId
        );
        if (!currentWorkspace) {
          setExportError("No workspace selected");
          return;
        }

        const currentScenario = currentWorkspace.children.find(
          (s: any) => s.id === currentScenarioId
        );
        if (!currentScenario) {
          setExportError("No scenario selected");
          return;
        }

        // Create a new workspace with only the selected scenario
        const exportWorkspace = {
          ...currentWorkspace,
          children: [currentScenario],
        };

        // Export in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            state: {
              items: [exportWorkspace], // Context items are included in the workspace
              selected: {
                workspace: exportWorkspace.id,
                scenario: currentScenario.id,
                node: "",
              },
              stateVersion: state.stateVersion,
              flowSession: {
                isPlaying: false,
                currentStepIndex: 0,
                temporarySteps: [],
              },
            },
            version: 1,
          },
        };

        FileService.exportDataToFile(exportData);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        "Export failed: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <RadioGroup
            value={exportType}
            onValueChange={(value) =>
              setExportType(value as "all" | "current-scenario")
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="all" id="export-all" />
              <div className="grid gap-1.5">
                <Label htmlFor="export-all" className="font-medium">
                  Export all workspaces
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export all workspaces with all scenarios, nodes, and
                  edges
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem
                value="current-scenario"
                id="export-current"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="export-current" className="font-medium">
                  Export current scenario only
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export only the currently selected scenario with its
                  nodes and edges
                </p>
                {exportType === "current-scenario" &&
                  (!currentWorkspaceId || !currentScenarioId) && (
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

      {exportError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleExport}
        disabled={
          exportType === "current-scenario" &&
          (!currentWorkspaceId || !currentScenarioId)
        }
        className="mt-4"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
    </>
  );
};