// src/modules/plugin/components/PluginsPanel.tsx
import React from 'react';
import { pluginRegistry } from '../plugin-registry';
import { usePluginStore } from '../store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export const PluginsPanel: React.FC = () => {
  const { activatePlugin, deactivatePlugin } = usePluginStore();
  
  // Get all plugins from registry
  const plugins = pluginRegistry.getAllPlugins();
  
  // Get plugin status from store
  const pluginStates = usePluginStore(state => state.plugins);
  
  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Version</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plugins.length > 0 ? (
              plugins.map(plugin => {
                const isActive = pluginStates[plugin.config.id]?.active || false;
                
                return (
                  <TableRow key={plugin.config.id}>
                    <TableCell className="font-medium">
                      {plugin.config.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {plugin.config.description}
                    </TableCell>
                    <TableCell className="text-xs">
                      {plugin.config.version}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={isActive ? "outline" : "secondary"} className="px-2 py-0.5">
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              activatePlugin(plugin.config.id);
                            } else {
                              deactivatePlugin(plugin.config.id);
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No plugins available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};  