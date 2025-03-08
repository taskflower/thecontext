/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/components/PluginAddDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PluginRegistration } from '../types';
import { usePluginManager } from '../pluginContext';

interface PluginAddDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onAddStep: (taskId: string, stepData: any) => void;
}

export function PluginAddDialog({
  open,
  onClose,
  taskId,
  onAddStep,
}: PluginAddDialogProps) {
  const pluginManager = usePluginManager();
  const [selectedPlugin, setSelectedPlugin] = useState<PluginRegistration | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get all plugins
  const allPlugins = pluginManager.getAllPlugins();

  // Get unique categories
  const categories = ['all', ...new Set(allPlugins.map(plugin => plugin.category))];

  // Filter plugins by category
  const filteredPlugins = activeCategory === 'all'
    ? allPlugins
    : allPlugins.filter(plugin => plugin.category === activeCategory);

  // Handle plugin selection
  const handleSelectPlugin = (plugin: PluginRegistration) => {
    setSelectedPlugin(plugin);
  };

  // Handle adding a step
  const handleAddStep = () => {
    if (!selectedPlugin) return;

    // Create step data
    const stepData = {
      type: selectedPlugin.id,
      title: selectedPlugin.name,
      description: selectedPlugin.description,
      data: { ...selectedPlugin.defaultConfig }
    };

    // Add step
    onAddStep(taskId, stepData);
    
    // Close dialog
    onClose();
  };

  // Reset selection when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset selection only when closing
      if (!open) {
        setSelectedPlugin(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dodaj nowy krok</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex-wrap">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="border rounded-md p-1">
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2">
              {filteredPlugins.map(plugin => (
                <div
                  key={plugin.id}
                  onClick={() => handleSelectPlugin(plugin)}
                  className={`
                    border rounded-md p-3 cursor-pointer transition-colors
                    ${selectedPlugin?.id === plugin.id 
                      ? 'border-primary bg-primary/10' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="font-medium">{plugin.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{plugin.description}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {selectedPlugin && (
              <span>Wybrany krok: <strong>{selectedPlugin.name}</strong></span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button onClick={handleAddStep} disabled={!selectedPlugin}>
              Dodaj krok
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}