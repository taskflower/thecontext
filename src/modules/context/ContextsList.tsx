// src/modules/context/ContextsList.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { ContextEditor } from "./ContextEditor";

export const ContextsList: React.FC = () => {
  const selected = useAppStore(state => state.selected);
  const getContextItems = useAppStore(state => state.getContextItems);
  
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const [showEditor, setShowEditor] = useState(false);
  
  const selectedWorkspace = selected.workspace;
  const contextItems = getContextItems(selectedWorkspace);
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Workspace Context</h3>
          <span className="text-xs text-muted-foreground">{contextItems.length} items</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowEditor(true)}
          className="gap-1.5 text-xs w-full"
        >
          <Database className="h-3.5 w-3.5" />
          Edit Context
        </Button>
      </div>
      
      {showEditor && (
        <ContextEditor
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};