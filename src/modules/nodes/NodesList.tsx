// src/modules/nodes/NodesList.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { ItemList } from "@/components/APPUI";
import { GraphNode } from "../types";
import { pluginRegistry } from "../plugin/plugin-registry";
import { usePluginStore } from "../plugin/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Puzzle, MessageCircle, Plus, Check, Power } from "lucide-react";
import { useDialogManager } from "@/hooks/useDialogManager";
import {
  Dialog as PluginDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  const selectNode = useAppStore((state) => state.selectNode);
  const updateNodePlugin = useAppStore((state) => state.updateNodePlugin);
  const selected = useAppStore((state) => state.selected);
  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];

  // Use the new dialog manager hook
  const { createDialog } = useDialogManager();

  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugin, setSelectedNodeForPlugin] = useState<
    string | null
  >(null);

  // Get all available plugins
  const availablePlugins = pluginRegistry.getAllPlugins();

  // Get plugin status from store
  const pluginStates = usePluginStore((state) => state.plugins);

  const handleAddNode = () => {
    createDialog(
      "New Node",
      [
        { name: "label", placeholder: "Node name" },
        {
          name: "assistant",
          placeholder: "Assistant message",
          type: "textarea",
        },
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
      {
        confirmText: "Add",
      }
    );
  };

  const handlePluginSelection = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation
    setSelectedNodeForPlugin(nodeId);

    // Find node and set its currently selected plugin
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedPlugin(node.plugin || "");
    } else {
      setSelectedPlugin("");
    }

    setShowPluginDialog(true);
  };

  const [selectedPlugin, setSelectedPlugin] = useState<string>("");

  const savePluginSelection = () => {
    if (selectedNodeForPlugin) {
      // If empty value was selected, pass undefined to remove the plugin
      updateNodePlugin(selectedNodeForPlugin, selectedPlugin || undefined);
      setShowPluginDialog(false);
    }
  };

  // Rozdziel dostępne pluginy na dwie kolumny
  const preparePluginsColumns = () => {
    const plugins = [...availablePlugins];
    const midpoint = Math.ceil(plugins.length / 2);
    return {
      leftColumn: plugins.slice(0, midpoint),
      rightColumn: plugins.slice(midpoint),
    };
  };

  const { leftColumn, rightColumn } = preparePluginsColumns();

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-auto">
        <ItemList<GraphNode>
          items={nodes}
          selected={selected.node || ""}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">{item.label}</div>
              <div className="flex items-center ">
                <Button
                  variant="ghost"
                  size={'sm'}
                  className={` flex gap-2 ${item.plugin ? "text-muted-foreground" : ""}`}
                  onMouseDown={(e) => handlePluginSelection(item.id, e)}
                  aria-label="Wybierz plugin"
                >
                  {item.plugin ? (
                    <Power className="h-3.5 w-3.5 text-green-500 " />
                  ) : (
                    <Puzzle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {item.plugin && (
                    <span>
                      {pluginRegistry.getPlugin(item.plugin)?.config.name ||
                        item.plugin}
                    </span>
                  )}
                </Button>
                {item.assistant && (
                  <Button variant={"ghost"}  size={'sm'}>
                    <MessageCircle className="h-3.5 w-3.5  text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          )}
          height="h-full"
        />
      </div>

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
                {/* Opcja "Brak pluginu" oddzielnie, jako pełna szerokość */}
                <Card
                  className={`p-3 mb-4 cursor-pointer border-2 transition-all ${
                    selectedPlugin === ""
                      ? "border-primary"
                      : "border-muted hover:border-muted-foreground"
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
                    {selectedPlugin === "" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>

                {/* Pluginy w dwóch kolumnach */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Lewa kolumna */}
                  <div className="space-y-3">
                    {leftColumn.map((plugin) => {
                      const isActive =
                        pluginStates[plugin.config.id]?.active || false;

                      return (
                        <Card
                          key={plugin.config.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.config.id
                              ? "border-primary"
                              : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.config.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.config.name}
                                <Badge
                                  variant={isActive ? "default" : "outline"}
                                  className="ml-2 text-xs"
                                >
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

                  {/* Prawa kolumna */}
                  <div className="space-y-3">
                    {rightColumn.map((plugin) => {
                      const isActive =
                        pluginStates[plugin.config.id]?.active || false;

                      return (
                        <Card
                          key={plugin.config.id}
                          className={`p-3 cursor-pointer border-2 transition-all ${
                            selectedPlugin === plugin.config.id
                              ? "border-primary"
                              : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => setSelectedPlugin(plugin.config.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {plugin.config.name}
                                <Badge
                                  variant={isActive ? "default" : "outline"}
                                  className="ml-2 text-xs"
                                >
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
              <Button
                variant="outline"
                onClick={() => setShowPluginDialog(false)}
              >
                Anuluj
              </Button>
              <Button onClick={savePluginSelection}>Zapisz</Button>
            </DialogFooter>
          </DialogContent>
        </PluginDialog>
      )}
    </div>
  );
};
