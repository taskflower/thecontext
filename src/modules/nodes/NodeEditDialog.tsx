/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/nodes/NodeEditDialog.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GraphNode } from "../types";
import { pluginRegistry } from "../plugin/plugin-registry";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceContext } from "../context/hooks/useContext";

interface NodeEditDialogProps {
  node: GraphNode;
  open: boolean;
  onClose: () => void;
  onUpdateNode: (
    nodeId: string, 
    label: string, 
    assistant: string, 
    contextSaveKey?: string,
    pluginOptions?: { [pluginId: string]: any }
  ) => void;
}

export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({ 
  node, 
  open, 
  onClose, 
  onUpdateNode 
}) => {
  console.log("NodeEditDialog mounting with node:", node);
  
  const [editNodeData, setEditNodeData] = useState({ 
    label: node.label, 
    assistant: node.assistant,
    contextSaveKey: node.contextSaveKey || "_none" 
  });
  
  // Initialize plugin options state
  const [pluginOptions, setPluginOptions] = useState<any>(
    node.pluginOptions?.[node.plugin || ""] || {}
  );

  // Get workspace context to display available keys
  const context = useWorkspaceContext();
  const contextItems = context.getAllItems();
  const contextKeys = contextItems.map(item => item.key);

  // Update plugin options when node or plugin changes
  useEffect(() => {
    if (node.plugin) {
      const plugin = pluginRegistry.getPlugin(node.plugin);
      if (plugin && plugin.config.optionsSchema) {
        // Initialize with defaults if not set
        const initialOptions: any = {};
        plugin.config.optionsSchema.forEach(option => {
          if (option.default !== undefined && !(option.id in (node.pluginOptions?.[node.plugin || ""] || {}))) {
            initialOptions[option.id] = option.default;
          }
        });
        
        // Merge with existing options
        setPluginOptions(() => ({
          ...initialOptions,
          ...(node.pluginOptions?.[node.plugin || ""] || {})
        }));
      }
    }
  }, [node.plugin, node.id]);

  const handleUpdateNode = () => {
    console.log("handleUpdateNode called with:", editNodeData);
    
    const updatedPluginOptions = node.plugin 
      ? { ...(node.pluginOptions || {}), [node.plugin]: pluginOptions } 
      : node.pluginOptions;
      
    const contextKey = editNodeData.contextSaveKey === "_none" ? undefined : editNodeData.contextSaveKey;
    
    console.log("Calling onUpdateNode with contextKey:", contextKey);
    
    onUpdateNode(
      node.id, 
      editNodeData.label, 
      editNodeData.assistant, 
      contextKey,
      updatedPluginOptions
    );
    onClose();
  };

  // Render plugin options if a plugin is selected
  const renderPluginOptions = () => {
    if (!node.plugin) return null;
    
    const plugin = pluginRegistry.getPlugin(node.plugin);
    if (!plugin) return null;
    
    // If plugin has custom options UI renderer, use it
    if (plugin.renderOptionsUI) {
      return plugin.renderOptionsUI(pluginOptions, setPluginOptions);
    }
    
    // Otherwise, render a default options UI based on schema
    if (plugin.config.optionsSchema && plugin.config.optionsSchema.length > 0) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Plugin Options: {plugin.config.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plugin.config.optionsSchema.map(option => (
              <div key={option.id} className="space-y-2">
                <Label htmlFor={option.id}>{option.label}</Label>
                
                {option.type === 'text' && (
                  <Input 
                    id={option.id}
                    value={pluginOptions[option.id] || ''}
                    onChange={e => setPluginOptions((prev: any) => ({ ...prev, [option.id]: e.target.value }))}
                  />
                )}
                
                {option.type === 'number' && (
                  <Input 
                    id={option.id}
                    type="number"
                    value={pluginOptions[option.id] || 0}
                    onChange={e => setPluginOptions((prev: any) => ({ ...prev, [option.id]: Number(e.target.value) }))}
                  />
                )}
                
                {option.type === 'boolean' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={option.id}
                      checked={!!pluginOptions[option.id]}
                      onCheckedChange={(checked) => 
                        setPluginOptions((prev: any) => ({ ...prev, [option.id]: checked }))
                      }
                    />
                    <Label htmlFor={option.id}>Enabled</Label>
                  </div>
                )}
                
                {option.type === 'select' && option.options && (
                  <Select 
                    value={pluginOptions[option.id] || ''}
                    onValueChange={value => setPluginOptions((prev: any) => ({ ...prev, [option.id]: value }))}
                  >
                    <SelectTrigger id={option.id}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {option.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={editNodeData.label}
            onChange={(e) =>
              setEditNodeData((prev) => ({ ...prev, label: e.target.value }))
            }
            placeholder="Node name"
          />
          <Textarea
            value={editNodeData.assistant}
            onChange={(e) =>
              setEditNodeData((prev) => ({ ...prev, assistant: e.target.value }))
            }
            placeholder="Assistant message"
            className="min-h-[80px]"
          />
          
          {/* Context Save Key - sekcja zapisu do kontekstu */}
          <div className="space-y-2">
            <Label htmlFor="contextSaveKey">Save user response to context key</Label>
            <Select 
              value={editNodeData.contextSaveKey}
              onValueChange={value => {
                console.log("Selected context key:", value);
                setEditNodeData((prev) => ({ ...prev, contextSaveKey: value }));
              }}
            >
              <SelectTrigger id="contextSaveKey">
                <SelectValue placeholder="Select context key or leave empty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Don't save to context</SelectItem>
                {contextKeys.map(key => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
                <SelectItem value="__new__">+ Create new context key</SelectItem>
              </SelectContent>
            </Select>
            
            {editNodeData.contextSaveKey === "__new__" && (
              <div className="mt-2">
                <Label htmlFor="newContextKey">New context key name</Label>
                <Input
                  id="newContextKey"
                  placeholder="Enter new context key name"
                  onChange={(e) => {
                    if (e.target.value) {
                      setEditNodeData((prev) => ({ ...prev, contextSaveKey: e.target.value }));
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Plugin options section */}
          {node.plugin && (
            <>
              <Separator />
              {renderPluginOptions()}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateNode}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};