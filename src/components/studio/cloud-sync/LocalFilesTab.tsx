// src/components/studio/cloud-sync/LocalFilesTab.tsx
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Loader } from "lucide-react";
import { Workspace } from "@/modules/workspaces/types";
import { useAppStore } from "@/modules/store";
import {
  validateWorkspace,
  addWorkspace,
  replaceWorkspace,
} from "./workspaceUtils";

interface LocalFilesTabProps {
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const LocalFilesTab: React.FC<LocalFilesTabProps> = ({
  currentWorkspace,
  isLoading,
  onError,
  onSuccess,
  setIsLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const state = useAppStore();

  // Export current workspace to a JSON file
  const handleExportWorkspace = () => {
    if (!currentWorkspace) {
      onError("No workspace selected for export");
      return;
    }

    try {
      setIsLoading(true);

      // Create a JSON blob
      const workspaceJson = JSON.stringify(currentWorkspace, null, 2);
      const blob = new Blob([workspaceJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `${currentWorkspace.title.replace(
        /\s+/g,
        "_"
      )}_workspace.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up
      URL.revokeObjectURL(url);
      onSuccess(
        `Workspace "${currentWorkspace.title}" has been exported to a JSON file`
      );
    } catch (error) {
      console.error("Error exporting workspace:", error);
      onError(
        `Failed to export workspace: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedWorkspace = JSON.parse(content) as Workspace;

        // Validate workspace data
        if (!importedWorkspace.id || !importedWorkspace.title) {
          throw new Error("Invalid workspace data: missing required fields");
        }

        // Ensure workspace has a valid children array
        const validWorkspace = validateWorkspace(importedWorkspace);

        // Check if workspace with this ID already exists locally
        const existingWorkspace = state.items.find(
          (w) => w.id === validWorkspace.id
        );

        if (existingWorkspace) {
          // Replace existing workspace
          replaceWorkspace(validWorkspace, existingWorkspace.id);
          onSuccess(
            `Workspace "${validWorkspace.title}" has been updated with imported data`
          );
        } else {
          // Add as new workspace
          addWorkspace(validWorkspace);
          onSuccess(
            `Workspace "${validWorkspace.title}" has been imported successfully`
          );
        }
      } catch (error) {
        console.error("Error importing workspace:", error);
        onError(
          `Failed to import workspace: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      onError("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
     

      <div className="flex items-center gap-4 ">
        {/* Export Section */}
        <div className="p-4 border rounded-md flex-1">
          <h4 className="text-base font-medium mb-2">Export Workspace</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Save the current workspace to a local JSON file.
          </p>

          <Button
            onClick={handleExportWorkspace}
            disabled={isLoading || !currentWorkspace}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export to JSON File
              </>
            )}
          </Button>

          {!currentWorkspace && (
            <p className="text-xs text-amber-600 mt-2">
              Select a workspace to enable export
            </p>
          )}
        </div>

        {/* Import Section */}
        <div className="p-4 border rounded-md flex-1">
          <h4 className="text-base font-medium mb-2">Import Workspace</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Load a workspace from a local JSON file.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <Button
            onClick={handleImportClick}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
                Import from JSON File
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocalFilesTab;
