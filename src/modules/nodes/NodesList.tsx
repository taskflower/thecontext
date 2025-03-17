/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/nodes/NodesList.tsx
import React, { useState, useMemo } from "react";
import { useAppStore } from "../store";
import { ItemList } from "@/components/APPUI";
import { GraphNode } from "../types";
import { pluginRegistry } from "../plugin/plugin-registry";
import { usePluginStore } from "../plugin/store";
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
  const selected = useAppStore((state) => state.selected);
  useAppStore((state) => state.stateVersion);

  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];

  // Plugin dialog state
  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugin, setSelectedNodeForPlugin] = useState<string | null>(null);
  const availablePlugins = pluginRegistry.getAllPlugins();
  const pluginStates = usePluginStore((state) => state.plugins);

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

  const [selectedPlugin, setSelectedPlugin] = useState<string>("");
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
    const plugins = [...availablePlugins];
    const midpoint = Math.ceil(plugins.length / 2);
    return { leftColumn: plugins.slice(0, midpoint), rightColumn: plugins.slice(midpoint) };
  };
  const { leftColumn, rightColumn } = preparePluginsColumns();

  // Node data update function
  const updateNodeData = (nodeId: string, label: string, assistant: string, pluginOptions?: { [pluginId: string]: any }) => {
    useAppStore.setState((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario) {
        const targetNode = scenario.children.find(n => n.id === nodeId);
        if (targetNode) {
          targetNode.label = label;
          targetNode.assistant = assistant;
          if (pluginOptions) {
            targetNode.pluginOptions = pluginOptions;
          }
          state.stateVersion++;
        }
      }
    });
  };

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
            className="pl-8"
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
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">{item.label}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => handlePluginSelection(item.id, e)}
                  aria-label="Select plugin"
                >
                  {item.plugin ? (
                    <Power className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Puzzle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {item.plugin && (
                    <span>
                      {pluginRegistry.getPlugin(item.plugin)?.config.name || item.plugin}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setEditingNode(item); }}
                  aria-label="Edit node"
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
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
                      const isActive = pluginStates[plugin.config.id]?.active || false;
                      return (
                        <Card
                          key={plugin.config.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.config.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.config.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.config.name}
                                <Badge variant={isActive ? "default" : "outline"} className="ml-2 text-xs">
                                  {isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.config.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                version: {plugin.config.version}
                              </div>
                            </div>
                            {selectedPlugin === plugin.config.id && (
                              <Check className="h-5 w-5 text-primary ml-2 shrink-0" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="space-y-3">
                    {rightColumn.map((plugin) => {
                      const isActive = pluginStates[plugin.config.id]?.active || false;
                      return (
                        <Card
                          key={plugin.config.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.config.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.config.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.config.name}
                                <Badge variant={isActive ? "default" : "outline"} className="ml-2 text-xs">
                                  {isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.config.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                version: {plugin.config.version}
                              </div>
                            </div>
                            {selectedPlugin === plugin.config.id && (
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