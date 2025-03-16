// src/modules/nodes/NodesList.tsx
import React, { useState } from 'react';
import { useDialogState } from '@/hooks';
import { useAppStore } from '../store';
import { CardPanel, Dialog, ItemList } from '@/components/APPUI';
import { GraphNode } from '../types';
import { pluginRegistry } from '../plugin/plugin-registry';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puzzle, MessageCircle } from 'lucide-react';
import {
  Dialog as PluginDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteNode = useAppStore(state => state.deleteNode);
  const addNode = useAppStore(state => state.addNode);
  const selectNode = useAppStore(state => state.selectNode);
  const updateNodePlugins = useAppStore(state => state.updateNodePlugins);
  const selected = useAppStore(state => state.selected);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    label: '', 
    assistant: '',
    plugins: [] 
  });
  
  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugins, setSelectedNodeForPlugins] = useState<string | null>(null);
  
  // Pobierz wszystkie dostępne wtyczki
  const availablePlugins = pluginRegistry.getAllPlugins();
  
  const handleAdd = () => {
    if (formData.label?.toString().trim()) {
      addNode({
        label: String(formData.label),
        assistant: String(formData.assistant || ''),
        plugins: Array.isArray(formData.plugins) ? formData.plugins : []
      });
      setIsOpen(false);
    }
  };
  
  const handlePluginSelection = (nodeId: string) => {
    setSelectedNodeForPlugins(nodeId);
    
    // Znajdź węzeł i ustaw jego aktualnie wybrane wtyczki
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setPluginSelections(node.plugins || []);
    } else {
      setPluginSelections([]);
    }
    
    setShowPluginDialog(true);
  };
  
  const [pluginSelections, setPluginSelections] = useState<string[]>([]);
  
  const handlePluginToggle = (pluginId: string) => {
    setPluginSelections(prev => {
      if (prev.includes(pluginId)) {
        return prev.filter(id => id !== pluginId);
      } else {
        return [...prev, pluginId];
      }
    });
  };
  
  const savePluginSelections = () => {
    if (selectedNodeForPlugins) {
      updateNodePlugins(selectedNodeForPlugins, pluginSelections);
      setShowPluginDialog(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Nodes" onAddClick={() => openDialog({ label: '', assistant: '', plugins: [] })}>
        <ItemList<GraphNode> 
          items={nodes}
          selected={selected.node || ""}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center justify-between p-2 gap-2">
              <div className="font-medium truncate">{item.label}</div>
              <div className="flex items-center gap-2 shrink-0">
                {item.plugins && item.plugins.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 h-5 text-xs">
                    <Puzzle className="h-3 w-3 mr-1" />
                    {item.plugins.length}
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePluginSelection(item.id);
                  }}
                >
                  <Puzzle className="h-3 w-3" />
                </Button>
                {item.assistant && (
                  <Badge variant="outline" className="px-1.5 h-5 text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                  </Badge>
                )}
              </div>
            </div>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="New Node"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'label', placeholder: 'Node name' },
            { name: 'assistant', placeholder: 'Assistant message' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
      
      {showPluginDialog && (
        <PluginDialog open={showPluginDialog} onOpenChange={(open) => !open && setShowPluginDialog(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Node Plugins</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <ScrollArea className="h-[60vh] max-h-60 pr-4">
                <div className="space-y-4">
                  {availablePlugins.length > 0 ? (
                    availablePlugins.map(plugin => (
                      <div key={plugin.config.id} className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id={`plugin-${plugin.config.id}`}
                          checked={pluginSelections.includes(plugin.config.id)}
                          onCheckedChange={() => handlePluginToggle(plugin.config.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`plugin-${plugin.config.id}`}
                            className="font-medium"
                          >
                            {plugin.config.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {plugin.config.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      No plugins available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPluginDialog(false)}>
                Cancel
              </Button>
              <Button onClick={savePluginSelections}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </PluginDialog>
      )}
    </>
  );
};