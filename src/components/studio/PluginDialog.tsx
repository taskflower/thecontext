// src/modules/graph/components/PluginDialog.tsx
import React, { useState, useEffect } from "react";
import { CheckCircle, Puzzle } from "lucide-react";
import { cn } from "@/utils/utils";
import {
  CancelButton,
  DialogModal,
  SaveButton,
} from "@/components/studio";
import { useAppStore } from "@/modules/store";
import useDynamicComponentStore from "@/modules/plugins/pluginsStore";

interface PluginDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  nodeId: string;
}

const PluginDialog: React.FC<PluginDialogProps> = ({
  isOpen,
  setIsOpen,
  nodeId,
}) => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  // Get node info when the dialog opens
  const state = useAppStore.getState();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const node = scenario?.children.find(n => n.id === nodeId);
  
  // Get all available plugins
  const pluginKeys = useDynamicComponentStore.getState().getComponentKeys();
  
  // Set the current plugin as selected when dialog opens
  useEffect(() => {
    if (isOpen && node) {
      setSelectedPlugin(node.pluginKey || null);
    }
  }, [isOpen, node]);

  // Handle plugin selection
  const handleSelectPlugin = (pluginKey: string | null) => {
    setSelectedPlugin(pluginKey);
  };
  
  // Handle save changes
  const handleSave = () => {
    // If removing plugin, pass null
    if (selectedPlugin === null) {
      useAppStore.getState().setNodePlugin(nodeId, null);
    } else {
      // When adding plugin we can initialize default data
      useAppStore.getState().setNodePlugin(nodeId, selectedPlugin, {});
    }
    setIsOpen(false);
  };

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
  };

  // Render footer actions
  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSave} />
    </>
  );

  if (!node) return null;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configure Plugin"
      description={`Select a plugin for node: ${node.label}`}
      footer={renderFooter()}
    >
      <div className="space-y-1 max-h-80 overflow-auto">
        <button
          onClick={() => handleSelectPlugin(null)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-md hover:bg-muted text-sm",
            !selectedPlugin && "bg-primary/10 text-primary"
          )}
        >
          <span>No Plugin</span>
          {!selectedPlugin && <CheckCircle className="h-4 w-4" />}
        </button>
        
        {pluginKeys.map(key => (
          <button
            key={key}
            onClick={() => handleSelectPlugin(key)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-md hover:bg-muted text-sm",
              selectedPlugin === key && "bg-primary/10 text-primary"
            )}
          >
            <div className="flex items-center">
              <Puzzle className="h-4 w-4 mr-2" />
              <span>{key}</span>
            </div>
            {selectedPlugin === key && <CheckCircle className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </DialogModal>
  );
};

export default PluginDialog;