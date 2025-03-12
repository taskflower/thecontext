/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, PowerOff, Puzzle, Unlink, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { usePluginStore } from '@/stores/pluginStore';
import { useNodeStore } from '@/stores/nodeStore';
import { PluginContainer } from '@/plugins/PluginContainer';

export const PluginsTab: React.FC = () => {
  const { 
    plugins, 
    getAllPlugins,
    getActivePlugins,
    activatePlugin,
    deactivatePlugin,
    isPluginActive
  } = usePluginStore();
  
  const { 
    nodes,
    assignPluginToNode,
    removePluginFromNode
  } = useNodeStore();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  
  const [previewPluginId, setPreviewPluginId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  
  // Get all plugins
  const allPlugins = getAllPlugins();
  
  // Get active plugins
  const activePlugins = getActivePlugins();
  
  // Get nodes with plugins
  const nodesWithPlugins = Object.values(nodes)
    .filter((node:any) => node.data.pluginId && plugins[node.data.pluginId])
    .map((node:any) => ({
      nodeId: node.id,
      pluginId: node.data.pluginId!,
      pluginName: plugins[node.data.pluginId!]?.name || 'Unknown Plugin'
    }));
  
  const handleAssignPlugin = () => {
    if (selectedNodeId && selectedPluginId) {
      assignPluginToNode(selectedNodeId, selectedPluginId);
      setSelectedNodeId('');
      setSelectedPluginId('');
    }
  };
  
  const handleOpenPluginPreview = (pluginId: string, nodeId?: string) => {
    setPreviewPluginId(pluginId);
    setPreviewNodeId(nodeId || null);
  };
  
  const handleClosePluginPreview = () => {
    setPreviewPluginId(null);
    setPreviewNodeId(null);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="active">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="active">Active Plugins</TabsTrigger>
          <TabsTrigger value="all">All Plugins</TabsTrigger>
          <TabsTrigger value="nodes">Nodes with Plugins</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Plugins</CardTitle>
                <CardDescription>
                  Plugins that are currently active and available for use
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activePlugins.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    No active plugins. Activate plugins from the "All Plugins" tab.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePlugins.map((plugin:any) => (
                      <div key={plugin.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{plugin.name}</h3>
                            <p className="text-sm text-slate-500">{plugin.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                v{plugin.version}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenPluginPreview(plugin.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deactivatePlugin(plugin.id)}
                            >
                              <PowerOff className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Available Plugins</CardTitle>
                <CardDescription>
                  All plugins installed in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allPlugins.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    No plugins found in the system.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allPlugins.map((plugin:any) => {
                      const isActive = isPluginActive(plugin.id);
                      
                      return (
                        <div key={plugin.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{plugin.name}</h3>
                                {isActive && (
                                  <Badge className="bg-green-100 text-green-800 h-5">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">{plugin.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-gray-50">
                                  v{plugin.version}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={isActive}
                                  onCheckedChange={(checked) => {
                                    if (checked) activatePlugin(plugin.id);
                                    else deactivatePlugin(plugin.id);
                                  }}
                                  id={`plugin-${plugin.id}`}
                                />
                                <Label htmlFor={`plugin-${plugin.id}`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </Label>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenPluginPreview(plugin.id)}
                                className="ml-2"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nodes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Plugin to Node</CardTitle>
                  <CardDescription>
                    Connect a plugin to a node to extend its functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Node</Label>
                      <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a node" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(nodes).map((node:any) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.type} ({node.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Select Plugin</Label>
                      <Select value={selectedPluginId} onValueChange={setSelectedPluginId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plugin" />
                        </SelectTrigger>
                        <SelectContent>
                          {activePlugins.map((plugin:any) => (
                            <SelectItem key={plugin.id} value={plugin.id}>
                              {plugin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handleAssignPlugin}
                      disabled={!selectedNodeId || !selectedPluginId}
                      className="w-full"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Assign Plugin to Node
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Nodes with Plugins</CardTitle>
                  <CardDescription>
                    Nodes that have plugins assigned to them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {nodesWithPlugins.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                      No nodes with plugins. Assign a plugin to a node using the form on the left.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {nodesWithPlugins.map(({ nodeId, pluginId, pluginName }) => (
                        <div key={nodeId} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{nodeId}</div>
                              <Badge variant="outline" className="mt-1 bg-blue-50">
                                <Puzzle className="h-3 w-3 mr-1" />
                                {pluginName}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenPluginPreview(pluginId, nodeId)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removePluginFromNode(nodeId)}
                              >
                                <Unlink className="h-4 w-4 mr-1" />
                                Detach
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Plugin Preview Dialog */}
      <Dialog open={previewPluginId !== null} onOpenChange={(open) => !open && handleClosePluginPreview()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Plugin Preview</DialogTitle>
            <DialogDescription>
              {previewNodeId 
                ? `Previewing plugin for node: ${previewNodeId}`
                : 'Previewing standalone plugin'
              }
            </DialogDescription>
          </DialogHeader>
          
          {previewPluginId && (
            <div className="mt-4">
              <PluginContainer 
                pluginId={previewPluginId} 
                nodeId={previewNodeId || undefined} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginsTab;