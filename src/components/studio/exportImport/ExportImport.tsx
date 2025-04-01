// src/components/studio/exportImport/ExportImport.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Save } from "lucide-react";
import { useAppStore } from "@/modules/store";

import { ConfirmationModal } from "./ConfirmationModal";
import { Workspace } from "@/modules/workspaces/types";
import { useAuth } from "@/context/AuthContext";
import { ExportTab } from "./ExportTab";
import { ImportTab } from "./ImportTab";
import { CloudTab } from "./CloudTab";

// Main ExportImport Component
export const ExportImport: React.FC = () => {
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(
    () => {}
  );
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");

  // Get app state
  const state = useAppStore();
  // Call the function to get the current workspace object
  const currentWorkspace = state.getCurrentWorkspace();

  // Get auth context
  const { currentUser } = useAuth();

  // Handle adding a new workspace
  const handleWorkspaceAdded = (workspace: Workspace) => {
    // Add workspace to state
    state.addWorkspace(workspace);
    // Switch to the new workspace
    state.selectWorkspace(workspace.id);
  };

  // Handle replacing an existing workspace by deleting and adding a new one
  const handleWorkspaceReplaced = (workspace: Workspace, oldWorkspaceId: string) => {
    // First, delete the old workspace
    state.deleteWorkspace(oldWorkspaceId);
    
    // Then add the new workspace
    state.addWorkspace(workspace);
    
    // Switch to the new workspace
    state.selectWorkspace(workspace.id);
  };

  // Confirmation dialog handlers
  const handleShowConfirmation = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationAction(() => action);
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleConfirmationConfirm = () => {
    confirmationAction();
    setShowConfirmation(false);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" /> Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="mr-2 h-4 w-4" /> Export
            </TabsTrigger>
            <TabsTrigger value="cloud">
              <Save className="mr-2 h-4 w-4" />
              Backup and Restore
            </TabsTrigger>
          </TabsList>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-4">
            <ExportTab state={state} />
          </TabsContent>

          {/* IMPORT TAB */}
          <TabsContent value="import" className="space-y-4">
            <ImportTab
              workspaces={state.items}
              showConfirmation={handleShowConfirmation}
            />
          </TabsContent>

          {/* BACKUP & RESTORE TAB */}
          <TabsContent value="cloud" className="space-y-4">
            <CloudTab
              currentUser={currentUser}
              currentWorkspace={currentWorkspace}
              workspaces={state.items}
              showConfirmation={handleShowConfirmation}
              onWorkspaceAdded={handleWorkspaceAdded}
              onWorkspaceReplaced={handleWorkspaceReplaced}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          title={confirmationTitle}
          message={confirmationMessage}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationClose}
        />
      )}
    </div>
  );
};

export default ExportImport;