import React, { useState } from "react";
import { PlusCircle, MoreHorizontal, X, Box, Square, Puzzle, CheckCircle, Settings, Sliders, Edit } from "lucide-react";
import { useAppStore } from "../../store";
import { FlowNode } from "../types";
import { cn } from "@/utils/utils";
import useDynamicComponentStore from "../../plugins/pluginsStore";
import PluginOptionsEditor from "./PluginOptionsEditor";
import AddNewNode from "./AddNewNode";
import EditNode from "./EditNode";


const NodesList: React.FC = () => {
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectedScenarioId = useAppStore((state) => state.selected.scenario);
  const selectedNodeId = useAppStore((state) => state.selected.node);
  
  const workspace = useAppStore((state) => 
    state.items.find((w) => w.id === selectedWorkspaceId)
  );
  const scenario = workspace?.children.find((s) => s.id === selectedScenarioId);
  const nodes = scenario?.children || [];
  
  const selectNode = useAppStore((state) => state.selectNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState<string>("");
  const [configurePluginForNodeId, setConfigurePluginForNodeId] = useState<string | null>(null);
  const [editPluginOptionsForNodeId, setEditPluginOptionsForNodeId] = useState<string | null>(null);
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  
  const handleEditNode = (id: string) => {
    setNodeToEdit(id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };
  
  const handleConfigurePlugin = (nodeId: string) => {
    setConfigurePluginForNodeId(nodeId);
    setMenuOpen(null);
  };
  
  const handleEditPluginOptions = (nodeId: string) => {
    setEditPluginOptionsForNodeId(nodeId);
    setMenuOpen(null);
  };
  
  if (!selectedScenarioId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a scenario first</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-base font-medium">Nodes</h2>
          {scenario && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Scenario: {scenario.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add node"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {nodes.length > 0 ? (
          <ul className="space-y-0.5">
            {nodes.map((node) => (
              <NodeItem
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                onSelect={selectNode}
                onDelete={deleteNode}
                menuOpen={menuOpen === node.id}
                toggleMenu={() => toggleMenu(node.id)}
                onConfigurePlugin={() => handleConfigurePlugin(node.id)}
                onEditPluginOptions={() => handleEditPluginOptions(node.id)}
                onEditNode={() => handleEditNode(node.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No nodes found</p>
            <p className="text-xs mt-1">Create a new node to get started</p>
          </div>
        )}
      </div>
      
      {/* Add New Node Dialog */}
      <AddNewNode isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
      
      {/* Edit Node Dialog */}
      <EditNode
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        nodeId={nodeToEdit}
      />
      
      {/* Plugin Configure Dialog */}
      {configurePluginForNodeId && (
        <SimplePluginDialog 
          nodeId={configurePluginForNodeId} 
          onClose={() => setConfigurePluginForNodeId(null)} 
        />
      )}

      {/* Plugin Options Editor Dialog */}
      {editPluginOptionsForNodeId && (
        <PluginOptionsEditor
          nodeId={editPluginOptionsForNodeId}
          onClose={() => setEditPluginOptionsForNodeId(null)}
        />
      )}
    </div>
  );
};

interface NodeItemProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  onConfigurePlugin: () => void;
  onEditPluginOptions: () => void;
  onEditNode: () => void;
}

const NodeItem: React.FC<NodeItemProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  menuOpen,
  toggleMenu,
  onConfigurePlugin,
  onEditPluginOptions,
  onEditNode
}) => {
  return (
    <li
      className={cn(
        "group flex items-center justify-between px-2 py-2 rounded-md",
        isSelected 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      <button
        className="flex items-center flex-1 min-w-0 text-left"
        onClick={() => onSelect(node.id)}
      >
        <div className="mr-2">
          {isSelected ? (
            <Box className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="truncate text-sm font-medium">{node.label}</span>
            {node.pluginKey && (
              <span className="ml-2 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full flex items-center">
                <Puzzle className="h-3 w-3 mr-1" />
                {node.pluginKey}
              </span>
            )}
          </div>
          <div className="flex items-center mt-0.5">
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              value: {node.assistantMessage?.slice(0, 10)}...
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
            </span>
          </div>
        </div>
      </button>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen 
              ? "bg-muted text-foreground" 
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditNode();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Node Data
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigurePlugin();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure Plugin
            </button>
            
            {node.pluginKey && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPluginOptions();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Edit Plugin Options
              </button>
            )}
            
            <button
              onClick={() => onDelete(node.id)}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

// Completely decoupled plugin dialog
const SimplePluginDialog = ({ nodeId, onClose }: { nodeId: string, onClose: () => void }) => {
  // Get node info before rendering the dialog content
  // Directly accessing values from state to avoid selector issues
  const state = useAppStore.getState();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const node = scenario?.children.find(n => n.id === nodeId);
  
  if (!node) return null;
  
  // Manual snapshot of current values to avoid re-renders
  const nodeLabel = node.label;
  const currentPluginKey = node.pluginKey;
  
  // Get plugins once, not in a React hook
  const pluginKeys = useDynamicComponentStore.getState().getComponentKeys();
  
  const handleSelect = (pluginKey: string | null) => {
    // If removing plugin, pass null
    if (pluginKey === null) {
      useAppStore.getState().setNodePlugin(nodeId, null);
    } else {
      // When adding plugin we can initialize default data
      useAppStore.getState().setNodePlugin(nodeId, pluginKey, {});
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Configure Plugin</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-4 text-sm">
          Select a plugin for node: <strong>{nodeLabel}</strong>
        </p>
        
        <div className="space-y-1 max-h-60 overflow-auto">
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm",
              !currentPluginKey && "bg-primary/10 text-primary"
            )}
          >
            <span>No Plugin</span>
            {!currentPluginKey && <CheckCircle className="h-4 w-4" />}
          </button>
          
          {pluginKeys.map(key => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm",
                currentPluginKey === key && "bg-primary/10 text-primary"
              )}
            >
              <div className="flex items-center">
                <Puzzle className="h-4 w-4 mr-2" />
                <span>{key}</span>
              </div>
              {currentPluginKey === key && <CheckCircle className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodesList;