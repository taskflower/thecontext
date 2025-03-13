/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/plugins/PluginContainer.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Settings, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePluginStore } from '@/stores/pluginStore';
import { useNodeStore } from '@/stores/nodeStore';
import { PluginProvider } from './PluginInterface';


interface PluginContainerProps {
  pluginId: string;
  nodeId?: string;
}

export const PluginContainer: React.FC<PluginContainerProps> = ({
  pluginId,
  nodeId
}) => {
  const { plugins, getPluginState, updatePluginConfig, isPluginActive } = usePluginStore();
  const { getNode, updateNodePluginConfig } = useNodeStore();
  
  const plugin = plugins[pluginId];
  
  // Handle missing plugin
  if (!plugin) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-red-500 bg-red-50">
          Plugin with ID "{pluginId}" was not found
        </CardContent>
      </Card>
    );
  }
  
  // Check if plugin is active
  if (!isPluginActive(pluginId)) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-amber-500 bg-amber-50">
          Plugin "{plugin.name}" is not active. Please activate it first.
        </CardContent>
      </Card>
    );
  }
  
  // Get config based on context (global plugin or node-specific)
  const pluginState = getPluginState(pluginId);
  let config = pluginState?.config || plugin.defaultConfig || {};
  
  // If nodeId provided, check for node-specific config
  if (nodeId) {
    const node = getNode(nodeId);
    if (node && node.data.pluginId === pluginId) {
      config = node.data.pluginConfig || config;
    }
  }
  
  // Config change handler
  const handleConfigChange = (updates: Record<string, any>) => {
    if (nodeId) {
      // Update node-specific plugin config
      updateNodePluginConfig(nodeId, updates);
    } else {
      // Update global plugin config
      updatePluginConfig(pluginId, updates);
    }
  };
  
  // Generate title based on context
  const title = nodeId 
    ? `${plugin.name} (Node: ${nodeId})` 
    : plugin.name;
  
  return (
    <PluginProvider pluginId={pluginId} nodeId={nodeId}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{plugin.description}</CardDescription>
            </div>
            {nodeId && (
              <Badge variant="outline" className="ml-2">
                Node: {nodeId}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid grid-cols-3 px-6">
            <TabsTrigger value="view">
              <Eye className="w-4 h-4 mr-2" />
              View
            </TabsTrigger>
            {plugin.ConfigComponent && (
              <TabsTrigger value="config">
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </TabsTrigger>
            )}
            {plugin.ResultComponent && (
              <TabsTrigger value="results">
                <BarChart className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
            )}
          </TabsList>
          
          <CardContent className="p-6">
            <TabsContent value="view" className="mt-0">
              
                <plugin.ViewComponent 
                  nodeId={nodeId}
                  config={config}
                  onConfigChange={handleConfigChange}
                />
             
            </TabsContent>
            
            {plugin.ConfigComponent && (
              <TabsContent value="config" className="mt-0">
                
                  <plugin.ConfigComponent 
                    nodeId={nodeId}
                    config={config}
                    onConfigChange={handleConfigChange}
                  />
                
              </TabsContent>
            )}
            
            {plugin.ResultComponent && (
              <TabsContent value="results" className="mt-0">
               
                  <plugin.ResultComponent 
                    nodeId={nodeId}
                    config={config}
                  />
               
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </PluginProvider>
  );
};