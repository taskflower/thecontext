// src/modules/plugin/components/PuginManager.tsx
import React, { useState, useMemo } from 'react';
import { pluginRegistry } from '../plugin-registry';
import { usePluginStore } from '../store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Puzzle } from 'lucide-react';

export const PluginManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activatePlugin, deactivatePlugin } = usePluginStore();
  
  // Use useMemo to prevent registry calls during each render
  const plugins = useMemo(() => pluginRegistry.getAllPlugins(), []);
  
  // Get plugin status from store
  const pluginStates = usePluginStore(state => state.plugins);
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-md"
        size="sm"
      >
        <Puzzle className="h-4 w-4 mr-2" />
        Plugins
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Plugin Manager</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] my-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                        <TableCell>
                          {plugin.config.description}
                        </TableCell>
                        <TableCell>
                          {plugin.config.version}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "success" : "secondary"} className="px-2 py-0.5">
                            {isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No plugins available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};