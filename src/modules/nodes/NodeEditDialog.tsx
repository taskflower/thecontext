/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState} from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraphNode } from '../types';
import { PluginSelector } from '../plugin/components/PluginSelector';
import { PluginOptions } from '../plugin/components/PluginOptions';
import { useWorkspaceContext } from '../context/hooks/useContext';

interface NodeEditDialogProps {
  node: GraphNode;
  open: boolean;
  onClose: () => void;
  onUpdateNode: (
    nodeId: string, 
    label: string, 
    assistant: string, 
    contextSaveKey?: string,
    pluginOptions?: Record<string, Record<string, any>>
  ) => void;
}

export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({ 
  node, 
  open, 
  onClose, 
  onUpdateNode 
}) => {
  const [nodeData, setNodeData] = useState({
    label: node.label,
    assistant: node.assistant,
    contextSaveKey: node.contextSaveKey || "_none",
    plugin: node.plugin || ""
  });
  
  // Stan opcji pluginu
  const [pluginOptions, setPluginOptions] = useState<Record<string, any>>(
    node.pluginOptions?.[node.plugin || ""] || {}
  );
  
  // Context dla zapisywania odpowiedzi użytkownika
  const context = useWorkspaceContext();
  const contextKeys = context.getAllItems().map(item => item.key);
  
  const handleUpdateNode = () => {
    // Zbierz zaktualizowane opcje pluginu
    const updatedPluginOptions = nodeData.plugin 
      ? { 
          ...(node.pluginOptions || {}), 
          [nodeData.plugin]: pluginOptions 
        } 
      : node.pluginOptions;
    
    // Przetwórz klucz kontekstu
    const contextKey = nodeData.contextSaveKey === "_none" 
      ? undefined 
      : nodeData.contextSaveKey;
    
    // Zaktualizuj węzeł
    onUpdateNode(
      node.id,
      nodeData.label,
      nodeData.assistant,
      contextKey,
      updatedPluginOptions
    );
    
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj węzeł</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Podstawowe dane węzła */}
          <div className="space-y-2">
            <Label htmlFor="nodeLabel">Nazwa węzła</Label>
            <Input
              id="nodeLabel"
              value={nodeData.label}
              onChange={(e) => setNodeData(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nodeAssistant">Wiadomość asystenta</Label>
            <Textarea
              id="nodeAssistant"
              value={nodeData.assistant}
              onChange={(e) => setNodeData(prev => ({ ...prev, assistant: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          
          {/* Wybór pluginu */}
          <div className="space-y-2">
            <Label htmlFor="nodePlugin">Plugin</Label>
            <PluginSelector
              value={nodeData.plugin}
              onChange={(plugin) => setNodeData(prev => ({ ...prev, plugin }))}
            />
          </div>
          
          {/* Opcje pluginu - wyświetlane tylko jeśli wybrano plugin */}
          {nodeData.plugin && (
            <PluginOptions
              pluginId={nodeData.plugin}
              value={pluginOptions}
              onChange={setPluginOptions}
            />
          )}
          
          <Separator />
          
          {/* Sekcja zapisu odpowiedzi do kontekstu */}
          <div className="space-y-2">
            <Label htmlFor="contextSaveKey">Zapisz odpowiedź użytkownika do klucza kontekstu</Label>
            <Select 
              value={nodeData.contextSaveKey}
              onValueChange={value => {
                setNodeData(prev => ({ ...prev, contextSaveKey: value }));
              }}
            >
              <SelectTrigger id="contextSaveKey">
                <SelectValue placeholder="Wybierz klucz kontekstu lub zostaw puste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Nie zapisuj do kontekstu</SelectItem>
                {contextKeys.map(key => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
                <SelectItem value="__new__">+ Utwórz nowy klucz kontekstu</SelectItem>
              </SelectContent>
            </Select>
            
            {nodeData.contextSaveKey === "__new__" && (
              <div className="mt-2">
                <Label htmlFor="newContextKey">Nazwa nowego klucza kontekstu</Label>
                <Input
                  id="newContextKey"
                  placeholder="Wprowadź nazwę nowego klucza kontekstu"
                  onChange={(e) => {
                    if (e.target.value) {
                      setNodeData(prev => ({ ...prev, contextSaveKey: e.target.value }));
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleUpdateNode}>
            Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};