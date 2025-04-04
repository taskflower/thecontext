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
    console.log("[DEBUG] handleWorkspaceAdded - workspace przed dodaniem:", 
      JSON.stringify({
        id: workspace.id,
        title: workspace.title,
        childrenCount: workspace.children?.length || 0
      }, null, 2));

    if (!workspace.children) {
      console.warn("[DEBUG] Tablica children nie istnieje, inicjalizuję jako pustą tablicę");
      workspace.children = [];
    }

    // Używamy set bezpośrednio zamiast addWorkspace
    useAppStore.setState((state) => {
      // Modyfikujemy kopię stanu
      return {
        ...state,
        items: [...state.items, workspace],
        selected: {
          ...state.selected,
          workspace: workspace.id,
          scenario: workspace.children && workspace.children.length > 0 ? workspace.children[0].id : "",
          node: ""
        },
        stateVersion: state.stateVersion + 1
      };
    });

    console.log("[DEBUG] Workspace dodany, liczba scenariuszy:", workspace.children.length);
  };

  // Handle replacing an existing workspace by deleting and adding a new one
  const handleWorkspaceReplaced = (workspace: Workspace, oldWorkspaceId: string) => {
    console.log("[DEBUG] handleWorkspaceReplaced - workspace przed zastąpieniem:", 
      JSON.stringify({
        id: workspace.id,
        title: workspace.title,
        childrenCount: workspace.children?.length || 0
      }, null, 2));

    if (!workspace.children) {
      console.warn("[DEBUG] Tablica children nie istnieje, inicjalizuję jako pustą tablicę");
      workspace.children = [];
    }

    // Używamy set bezpośrednio zamiast metod state
    useAppStore.setState((state) => {
      // Najpierw usuń stary workspace
      const filteredItems = state.items.filter(item => item.id !== oldWorkspaceId);
      
      // Następnie dodaj nowy workspace
      return {
        ...state,
        items: [...filteredItems, workspace],
        selected: {
          ...state.selected,
          workspace: workspace.id,
          scenario: workspace.children && workspace.children.length > 0 ? workspace.children[0].id : "",
          node: ""
        },
        stateVersion: state.stateVersion + 1
      };
    });
    
    console.log("[DEBUG] Workspace zastąpiony, liczba scenariuszy:", workspace.children.length);
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