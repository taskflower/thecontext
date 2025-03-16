// src/modules/context/ContextsList.tsx
import React, { useState } from "react";
import { useDialogState } from "@/hooks";
import { useAppStore } from "../store";
import { CardPanel, Dialog, ItemList } from "@/components/APPUI";
import { Context } from "./types";

import { Database } from "lucide-react";
import { ContextEditor } from "./ContextEditor";

export const ContextsList: React.FC = () => {
  const contexts = useAppStore(state => state.contexts || []);
  const selectedWorkspace = useAppStore(state => state.selected.workspace);
  const selectedContext = useAppStore(state => state.selectedContext);
  const selectContext = useAppStore(state => state.selectContext);
  const deleteContext = useAppStore(state => state.deleteContext);
  const addContext = useAppStore(state => state.addContext);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const [showEditor, setShowEditor] = useState(false);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    name: ''
  });
  
  const handleAdd = () => {
    if (formData.name?.toString().trim() && selectedWorkspace) {
      addContext({
        name: String(formData.name),
        workspaceId: selectedWorkspace
      });
      setIsOpen(false);
      setShowEditor(true); // Pokaż edytor dla nowo utworzonego kontekstu
    }
  };
  
  // Filtruj konteksty do aktualnego workspace
  const workspaceContexts = contexts.filter(c => c.workspaceId === selectedWorkspace);
  
  return (
    <>
      <CardPanel title="Context" onAddClick={() => openDialog({ name: '' })}>
        ??????????????????
        <ItemList<Context> 
          items={workspaceContexts}
          selected={selectedContext || ""}
          onClick={(id) => {
            selectContext(id);
            setShowEditor(true);
          }}
          onDelete={deleteContext}
          renderItem={(item) => (
            <div className="flex items-center justify-between p-2 gap-2">
              <div className="grow overflow-hidden">
                <div className="font-medium flex items-center">
                  <Database className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5 ml-5.5">
                  {item.items.length} items
                </div>
              </div>
            </div>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="New Context"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'name', placeholder: 'Context name' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
      
      {showEditor && selectedContext && (
        <ContextEditor 
          contextId={selectedContext}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
};