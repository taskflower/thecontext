// src/modules/nodes/NodesList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useAppStore } from "../store";
import { ItemList } from "@/components/APPUI";
import { GraphNode } from "../types";
import { usePluginStore } from "../plugin/store";  // Używamy nowego store zamiast registry
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Puzzle, MoreHorizontal, Plus, Check, Power, Search } from "lucide-react";
import {
  Dialog as PluginDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NodeCreateDialog } from "./NodeCreateDialog";
import { NodeEditDialog } from "./NodeEditDialog";

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  const selectNode = useAppStore((state) => state.selectNode);
  const updateNodePlugin = useAppStore((state) => state.updateNodePlugin);
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const selected = useAppStore((state) => state.selected);
  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  // Użyj nowego store pluginów zamiast registry
  const { plugins, activePlugins } = usePluginStore();
  const availablePlugins = useMemo(() => Object.values(plugins), [plugins]);

  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];

  // Plugin dialog state
  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugin, setSelectedNodeForPlugin] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<string>("");

  // Create/Edit dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);

  // Node search state
  const [searchTerm, setSearchTerm] = useState("");

  // Plugin selection handling
  const handlePluginSelection = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeForPlugin(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedPlugin(node?.plugin || "");
    setShowPluginDialog(true);
  };

  const savePluginSelection = () => {
    if (selectedNodeForPlugin) {
      updateNodePlugin(selectedNodeForPlugin, selectedPlugin || undefined);
      setShowPluginDialog(false);
    }
  };

  // Filtered and searched nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  // Prepare plugins for two-column layout
  const preparePluginsColumns = () => {
    const pluginsList = [...availablePlugins];
    const midpoint = Math.ceil(pluginsList.length / 2);
    return { leftColumn: pluginsList.slice(0, midpoint), rightColumn: pluginsList.slice(midpoint) };
  };
  const { leftColumn, rightColumn } = preparePluginsColumns();

  // Pomocnicza funkcja do sprawdzania, czy plugin jest aktywny
  const isPluginActive = (pluginId: string) => activePlugins.includes(pluginId);

  // Pomocnicza funkcja do uzyskiwania nazwy pluginu
  const getPluginName = (pluginId: string) => plugins[pluginId]?.name || pluginId;

  return (
    <div className="flex flex-col h-full">
      {/* List Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Nodes</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-auto">
        <ItemList<GraphNode>
          items={filteredNodes}
          selected={selected.node || ""}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="text-xs font-medium flex items-center justify-between w-full">
              <div className="flex flex-col mr-1">
                <span className="truncate max-w-36">{item.label}</span>
                {item.contextSaveKey && item.contextSaveKey !== "_none" && (
                  <div className="flex items-center mt-0.5">
                    <svg className="w-3 h-3 mr-1 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    <Badge variant="outline" className="text-[0.65rem] px-1 py-0 h-4">
                      {item.contextSaveKey}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center shrink-0">
                {/* Plugin indicator/button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 mr-0.5"
                  title={item.plugin ? 
                    `Plugin: ${getPluginName(item.plugin)}` : 
                    "Select plugin"
                  }
                  onClick={(e) => handlePluginSelection(item.id, e)}
                >
                  {item.plugin ? (
                    <Power className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Puzzle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
                
                {/* Edit button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  title="Edit node"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingNode(item); 
                  }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          height="h-full"
        />
      </div>

      {/* Plugin Selection Dialog */}
      {showPluginDialog && (
        <PluginDialog
          open={showPluginDialog}
          onOpenChange={(open) => !open && setShowPluginDialog(false)}
        >
          <DialogContent className="sm:max-w-5xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Plugin for Node</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[60vh] max-h-[calc(80vh-150px)] pr-4">
                {/* No Plugin Option */}
                <Card
                  className={`p-3 mb-4 cursor-pointer border-2 transition-all ${
                    selectedPlugin === "" ? "border-primary" : "border-muted hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedPlugin("")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">No Plugin</div>
                      <p className="text-sm text-muted-foreground">
                        Node without additional functionality
                      </p>
                    </div>
                    {selectedPlugin === "" && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </Card>

                {/* Plugins in Two Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {leftColumn.map((plugin) => {
                      const isActive = isPluginActive(plugin.id);
                      return (
                        <Card
                          key={plugin.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.name}
                                <Badge variant={isActive ? "default" : "outline"} className="ml-2 text-xs">
                                  {isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                version: {plugin.version}
                              </div>
                            </div>
                            {selectedPlugin === plugin.id && (
                              <Check className="h-5 w-5 text-primary ml-2 shrink-0" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="space-y-3">
                    {rightColumn.map((plugin) => {
                      const isActive = isPluginActive(plugin.id);
                      return (
                        <Card
                          key={plugin.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.name}
                                <Badge variant={isActive ? "default" : "outline"} className="ml-2 text-xs">
                                  {isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                version: {plugin.version}
                              </div>
                            </div>
                            {selectedPlugin === plugin.id && (
                              <Check className="h-5 w-5 text-primary ml-2 shrink-0" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                {availablePlugins.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">
                    No available plugins
                  </div>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPluginDialog(false)}>
                Cancel
              </Button>
              <Button onClick={savePluginSelection}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </PluginDialog>
      )}

      {/* Create Node Dialog */}
      <NodeCreateDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAddNode={(label, assistant) => {
          addNode({
            label, 
            assistant, 
            plugin: undefined
          });
        }}
      />

      {/* Edit Node Dialog */}
      {editingNode && (
        <NodeEditDialog 
          node={editingNode}
          open={!!editingNode}
          onClose={() => setEditingNode(null)}
          onUpdateNode={updateNodeData}
        />
      )}
    </div>
  );
};