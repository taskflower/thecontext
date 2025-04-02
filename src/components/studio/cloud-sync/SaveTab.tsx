// src/components/studio/cloud-sync/SaveTab.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader } from "lucide-react";
import { Workspace } from "@/modules/workspaces/types";

interface SaveTabProps {
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  existsInCloud: boolean;
  onSave: () => void;
}

export const SaveTab: React.FC<SaveTabProps> = ({
  currentWorkspace,
  isLoading,
  existsInCloud,
  onSave,
}) => {
  if (!currentWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center text-center py-6 text-muted-foreground">
        <div>
          <p>No workspace selected</p>
          <p className="text-sm mt-1">
            Select a workspace to save it to the cloud
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      <div className="p-4 bg-secondary/30 rounded-md">
        <p className="font-medium text-lg">{currentWorkspace.title}</p>

        {currentWorkspace.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {currentWorkspace.description}
          </p>
        )}

        {existsInCloud && (
          <div className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200 dark:border-amber-800">
            This workspace already exists in the cloud and will be overwritten
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Button onClick={onSave} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CloudUpload className="h-4 w-4 mr-2" />
              Save to Firebase
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SaveTab;