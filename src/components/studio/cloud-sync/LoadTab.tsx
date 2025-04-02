// src/components/studio/cloud-sync/LoadTab.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CloudDownload, Loader, RefreshCw } from "lucide-react";
import WorkspaceCard from "./WorkspaceCard";
import { useAppStore } from "@/modules/store";

interface CloudWorkspace {
  id: string;
  title: string;
  description?: string;
  updatedAt: number;
  createdAt: number;
}

interface LoadTabProps {
  cloudWorkspaces: CloudWorkspace[];
  selectedWorkspaceId: string | null;
  isLoading: boolean;
  onSelectWorkspace: (id: string) => void;
  onLoadWorkspace: () => void;
  onRefresh: () => void;
}

export const LoadTab: React.FC<LoadTabProps> = ({
  cloudWorkspaces,
  selectedWorkspaceId,
  isLoading,
  onSelectWorkspace,
  onLoadWorkspace,
  onRefresh,
}) => {
  const state = useAppStore();
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium">Cloud Workspaces</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {isLoading && cloudWorkspaces.length === 0 ? (
        <div className="flex-1 flex justify-center items-center py-6">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : cloudWorkspaces.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center py-6 text-muted-foreground border border-dashed rounded-md">
          <div>
            <p>No workspaces found in Firebase</p>
            <p className="text-sm mt-1">
              Save a workspace to be able to load it later
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col">
          <ScrollArea className="flex-1 rounded-md border">
            <div className="p-1">
              {cloudWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  id={workspace.id}
                  title={workspace.title}
                  description={workspace.description}
                  updatedAt={workspace.updatedAt}
                  isSelected={selectedWorkspaceId === workspace.id}
                  existsLocally={state.items.some((w) => w.id === workspace.id)}
                  onSelect={onSelectWorkspace}
                />
              ))}
            </div>
          </ScrollArea>

          <Button
            onClick={onLoadWorkspace}
            disabled={isLoading || !selectedWorkspaceId}
            className="mt-auto"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CloudDownload className="h-4 w-4 mr-2" />
                Load Selected Workspace
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadTab;