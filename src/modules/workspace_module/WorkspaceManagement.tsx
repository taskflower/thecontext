/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/workspaces_module/WorkspaceManagement.tsx
import React, { useState } from "react";
import { useWorkspaceStore, WorkspaceType } from "./workspaceStore";
import { exportToJsonFile, parseJsonFile } from "../shared/jsonUtils";
import MDialog from "@/components/MDialog";
import { Button } from "@/components/ui/button";

import WorkspaceContextCard from "./components/WorkspaceContextCard";
import WorkspacesList from "./components/WorkspacesList";
import CreateWorkspaceForm from "./components/CreateWorkspaceForm";
import WorkspaceManagementHeader from "./components/WorkspaceManagementHeader";

const WorkspaceManagement: React.FC = () => {
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    createWorkspace,
    deleteWorkspace,
    exportWorkspaceToJson,
    importWorkspaceFromJson,
  } = useWorkspaceStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCreateWorkspace = (
    name: string,
    type: WorkspaceType,
    typeIcon: string,
    description: string,
    initialContext: Record<string, any>
  ) => {
    createWorkspace(name, type, typeIcon, description, initialContext);
    setShowCreateModal(false);
  };

  const handleEditWorkspace = () => {
    // Placeholder for edit logic
    setEditWorkspaceId(null);
  };

  const handleDeleteWorkspace = () => {
    if (showDeleteConfirm) {
      deleteWorkspace(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleExportWorkspace = () => {
    if (!currentWorkspaceId) return;

    const data = exportWorkspaceToJson(currentWorkspaceId);
    if (data) {
      exportToJsonFile(
        data,
        `workspace_${workspaces[currentWorkspaceId].name
          .toLowerCase()
          .replace(/\s+/g, "_")}.json`
      );
    }
    setShowExportModal(false);
  };

  const handleImportWorkspace = async (file: File) => {
    try {
      const data = await parseJsonFile(file);
      const workspaceId = importWorkspaceFromJson(data);

      if (workspaceId) {
        setCurrentWorkspace(workspaceId);
      }
      setShowImportModal(false);
    } catch (error) {
      console.error("Error importing workspace:", error);
      alert("Failed to import workspace. The file format may be invalid.");
    }
  };

  return (
    <div className="space-y-6">
      <WorkspaceManagementHeader 
        onCreateWorkspace={() => setShowCreateModal(true)} 
        onExport={() => setShowExportModal(true)} 
        onImport={() => setShowImportModal(true)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WorkspacesList
            onCreateWorkspace={() => setShowCreateModal(true)}
            onSelectWorkspace={setCurrentWorkspace}
            onEditWorkspace={setEditWorkspaceId}
            onDeleteWorkspace={setShowDeleteConfirm}
          />
        </div>

        <div className="md:col-span-1">
          <WorkspaceContextCard />
        </div>
      </div>

      {/* Create workspace modal */}
      <MDialog
        title="Create New Workspace"
        description="Define a workspace for your analysis"
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
      >
        <CreateWorkspaceForm
          onSubmit={handleCreateWorkspace}
          onCancel={() => setShowCreateModal(false)}
        />
      </MDialog>

      {/* Edit workspace modal */}
      <MDialog
        title="Edit Workspace"
        description="Change workspace settings"
        isOpen={!!editWorkspaceId}
        onOpenChange={(open) => !open && setEditWorkspaceId(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditWorkspaceId(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditWorkspace}>Save Changes</Button>
          </>
        }
      >
        <p>Edit workspace settings...</p>
      </MDialog>

      {/* Delete confirmation */}
      <MDialog
        title="Delete Workspace?"
        description={`Are you sure you want to delete the workspace "${
          showDeleteConfirm ? workspaces[showDeleteConfirm]?.name : ""
        }"? This action cannot be undone.`}
        isOpen={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkspace}>
              Delete Workspace
            </Button>
          </>
        }
      >
        <div className="p-4 bg-red-50 rounded-md border border-red-100 text-red-600">
          <p>
            Deleting this workspace will not remove associated scenarios, but you will
            lose the defined analysis context.
          </p>
        </div>
      </MDialog>

      {/* Export modal */}
      <MDialog
        title="Export Workspace"
        description="Save the current workspace with all scenarios"
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportWorkspace}
              disabled={!currentWorkspaceId}
            >
              Export
            </Button>
          </>
        }
      >
        {currentWorkspaceId && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <p className="font-medium">
                {workspaces[currentWorkspaceId].name}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {workspaces[currentWorkspaceId].description}
              </p>
            </div>

            <p className="text-sm">Export includes:</p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Workspace configuration</li>
              <li>Analysis context</li>
              <li>All associated scenarios</li>
            </ul>
          </div>
        )}
      </MDialog>

      {/* Import modal */}
      <MDialog
        title="Import Workspace"
        description="Load a workspace from a JSON file"
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
      >
        <div className="space-y-4">
          <p className="text-sm">
            Select a JSON file containing a previously exported workspace:
          </p>

          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportWorkspace(file);
                }
              }}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <p className="text-sm text-slate-500">
            Import will add a new workspace to your existing workspaces.
          </p>
        </div>
      </MDialog>
    </div>
  );
};

export default WorkspaceManagement;