import React, { useState } from "react";
import { PlusCircle, MoreHorizontal, X, Box, Square } from "lucide-react";
import { useAppStore } from "../../store";
import { FlowNode } from "../types";
import { useDialogState } from "../../common/hooks";
import { cn } from "@/utils/utils";

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
  const addNode = useAppStore((state) => state.addNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState<{
    label: string;
    value: string;
  }>({
    label: "",
    value: "",
  });
  
  const handleAddNode = () => {
    if (!formData.label.trim()) return;
    addNode({
      label: formData.label,
      value: formData.value || "0",
    });
    setIsOpen(false);
  };
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
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
          onClick={() => openDialog()}
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
      
      {/* Add Node Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Node</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="label" className="block text-sm font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Enter node label"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div>
                <label htmlFor="value" className="block text-sm font-medium mb-1">
                  Value
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="Enter node value"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNode}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Node
                </button>
              </div>
            </div>
          </div>
        </div>
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
}

const NodeItem: React.FC<NodeItemProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  menuOpen,
  toggleMenu,
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
          <span className="truncate text-sm font-medium">{node.label}</span>
          <div className="flex items-center mt-0.5">
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              value: {node.value}
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
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
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

export default NodesList;