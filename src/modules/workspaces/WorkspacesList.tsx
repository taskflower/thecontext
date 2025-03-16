// src/modules/workspaces/WorkspacesList.tsx
import React from "react";
import { useDialogState } from "@/hooks";
import { useAppStore } from '../store';
import { Dialog, ItemList } from "@/components/APPUI";
import { Workspace } from "../types";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WorkspacesList: React.FC = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectWorkspace = useAppStore(state => state.selectWorkspace);
  const deleteWorkspace = useAppStore(state => state.deleteWorkspace);
  const addWorkspace = useAppStore(state => state.addWorkspace);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ title: '' });
  
  const handleAdd = () => {
    if (formData.title?.toString().trim()) {
      addWorkspace({
        title: String(formData.title)
      });
      setIsOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Workspaces</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => openDialog({ title: '' })} 
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
            <div className="p-2 font-medium flex items-center">
              <FolderOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {item.title}
            </div>
          )}
          height="h-full"
        />
      </div>
      
      {isOpen && (
        <Dialog 
          title="New Workspace"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[{ name: 'title', placeholder: 'Workspace name' }]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};