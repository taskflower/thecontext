// src/modules/workspaces/WorkspacesList.tsx
import React from "react";
import { useAppStore } from '../store';
import { ItemList } from "@/components/APPUI";
import { Workspace } from "../types";
import { FolderOpen, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogManager } from '@/hooks/useDialogManager';

export const WorkspacesList: React.FC = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectWorkspace = useAppStore(state => state.selectWorkspace);
  const deleteWorkspace = useAppStore(state => state.deleteWorkspace);
  const addWorkspace = useAppStore(state => state.addWorkspace);
  const updateWorkspace = useAppStore(state => state.updateWorkspace);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  // Use the new dialog manager hook
  const { createDialog } = useDialogManager();
  
  const handleAddWorkspace = () => {
    createDialog(
      "New Workspace",
      [{ 
        name: 'title', 
        placeholder: 'Workspace name',
        type: 'text',
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }],
      (data) => {
        if (data.title?.toString().trim()) {
          addWorkspace({
            title: String(data.title)
          });
        }
      },
      {
        confirmText: "Add",
        size: 'sm'
      }
    );
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    createDialog(
      "Edit Workspace",
      [{ 
        name: 'title', 
        placeholder: 'Workspace name',
        type: 'text',
        value: workspace.title,
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }],
      (data) => {
        if (data.title?.toString().trim()) {
          updateWorkspace(workspace.id, {
            title: String(data.title)
          });
        }
      },
      {
        confirmText: "Update",
        size: 'sm'
      }
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Workspaces</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAddWorkspace} 
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ItemList<Workspace> 
          items={items}
          selected={selected.workspace}
          onClick={selectWorkspace}
          onDelete={deleteWorkspace}
          renderItem={(item) => (
            <div className="p-2 font-medium flex items-center justify-between w-full">
              <div className="flex items-center">
                <FolderOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {item.title}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditWorkspace(item);
                }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          height="h-full"
        />
      </div>
    </div>
  );
};