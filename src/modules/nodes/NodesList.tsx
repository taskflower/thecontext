// src/modules/nodes/NodesList.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { ItemList } from "@/components/APPUI";
import { GraphNode } from "../types";
import { pluginRegistry } from "../plugin/plugin-registry";
import { usePluginStore } from "../plugin/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Puzzle, MoreHorizontal, Plus, Check, Power } from "lucide-react";
import { useDialogManager } from "@/hooks/useDialogManager";
import {
  Dialog as PluginDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  const selectNode = useAppStore((state) => state.selectNode);
  const updateNodePlugin = useAppStore((state) => state.updateNodePlugin);
  const selected = useAppStore((state) => state.selected);
  // Wymuszamy aktualizację komponentu przy zmianie stanu
  useAppStore((state) => state.stateVersion);

  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];

  // Dialog do wyboru pluginu
  const { createDialog } = useDialogManager();
  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugin, setSelectedNodeForPlugin] = useState<string | null>(null);
  const availablePlugins = pluginRegistry.getAllPlugins();
  const pluginStates = usePluginStore((state) => state.plugins);

  const handleAddNode = () => {
    createDialog(
      "New Node",
      [
        { name: "label", placeholder: "Node name" },
        { name: "assistant", placeholder: "Assistant message", type: "textarea" },
      ],
      (data) => {
        if (data.label?.toString().trim()) {
          addNode({
            label: String(data.label),
            assistant: String(data.assistant || ""),
            plugin: undefined,
          });
        }
      },
      { confirmText: "Add" }
    );
  };

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

  // Rozdzielenie dostępnych pluginów na dwie kolumny
  const preparePluginsColumns = () => {
    const plugins = [...availablePlugins];
    const midpoint = Math.ceil(plugins.length / 2);
    return { leftColumn: plugins.slice(0, midpoint), rightColumn: plugins.slice(midpoint) };
  };
  const { leftColumn, rightColumn } = preparePluginsColumns();

  // Stany i funkcje do edycji danych węzła
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [editNodeData, setEditNodeData] = useState({ label: "", assistant: "" });

  const handleEditNode = (node: GraphNode) => {
    setEditingNode(node);
    setEditNodeData({ label: node.label, assistant: node.assistant });
  };

  const updateNodeData = (nodeId: string, label: string, assistant: string) => {
    useAppStore.setState((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario) {
        const targetNode = scenario.children.find(n => n.id === nodeId);
        if (targetNode) {
          targetNode.label = label;
          targetNode.assistant = assistant;
          state.stateVersion++;
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek listy */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Nodes</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddNode}
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista węzłów */}
      <div className="flex-1 overflow-auto">
        <ItemList<GraphNode>
          items={nodes}
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
                  aria-label="Wybierz plugin"
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
                  onClick={(e) => { e.stopPropagation(); handleEditNode(item); }}
                  aria-label="Edytuj dane węzła"
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          )}
          height="h-full"
        />
      </div>

      {/* Dialog wyboru pluginu */}
      {showPluginDialog && (
        <PluginDialog
          open={showPluginDialog}
          onOpenChange={(open) => !open && setShowPluginDialog(false)}
        >
          <DialogContent className="sm:max-w-5xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Wybierz plugin dla węzła</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[60vh] max-h-[calc(80vh-150px)] pr-4">
                {/* Opcja "Brak pluginu" */}
                <Card
                  className={`p-3 mb-4 cursor-pointer border-2 transition-all ${
                    selectedPlugin === "" ? "border-primary" : "border-muted hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedPlugin("")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Brak pluginu</div>
                      <p className="text-sm text-muted-foreground">
                        Węzeł bez dodatkowej funkcjonalności
                      </p>
                    </div>
                    {selectedPlugin === "" && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </Card>

                {/* Pluginy w dwóch kolumnach */}
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
                                  {isActive ? "Aktywny" : "Nieaktywny"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.config.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                wersja: {plugin.config.version}
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
                                  {isActive ? "Aktywny" : "Nieaktywny"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plugin.config.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                wersja: {plugin.config.version}
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
                    Brak dostępnych pluginów
                  </div>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPluginDialog(false)}>
                Anuluj
              </Button>
              <Button onClick={savePluginSelection}>Zapisz</Button>
            </DialogFooter>
          </DialogContent>
        </PluginDialog>
      )}

      {/* Dialog edycji węzła */}
      {editingNode && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setEditingNode(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edytuj dane węzła</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editNodeData.label}
                onChange={(e) =>
                  setEditNodeData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Nazwa węzła"
              />
              <Textarea
                value={editNodeData.assistant}
                onChange={(e) =>
                  setEditNodeData((prev) => ({ ...prev, assistant: e.target.value }))
                }
                placeholder="Wiadomość asystenta"
                className="min-h-[80px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNode(null)}>
                Anuluj
              </Button>
              <Button
                onClick={() => {
                  if (editingNode) {
                    updateNodeData(editingNode.id, editNodeData.label, editNodeData.assistant);
                  }
                  setEditingNode(null);
                }}
              >
                Zapisz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
