/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/create-workspace/index.tsx
import React, { useState } from 'react';
import { PluginBase, PluginProps } from '../../modules/plugins_system/PluginInterface';
import { Node } from '../../modules/scenarios_module/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";


import { WorkspaceType } from '@/modules/workspace_module/workspaceStore';
import { useToast } from '@/hooks/useToast';
import { extractDomainFromUrl } from './utils';

interface CreateWorkspacePluginConfig {
  nameTemplate: string;
  workspaceType: WorkspaceType;
  autoCreateScenario: boolean;
  urlNodeId: string;
  audienceNodeId: string;
  businessGoalNodeId: string;
  includeUrl: boolean;
  includeAudience: boolean;
  includeBusinessGoal: boolean;
  additionalContextKeys: Array<{nodeId: string, key: string}>;
}

const defaultConfig: CreateWorkspacePluginConfig = {
  nameTemplate: "Analiza {{domain}}",
  workspaceType: "website",
  autoCreateScenario: true,
  urlNodeId: "start",
  audienceNodeId: "",
  businessGoalNodeId: "",
  includeUrl: true,
  includeAudience: false,
  includeBusinessGoal: false,
  additionalContextKeys: []
};

class CreateWorkspacePlugin extends PluginBase {
  constructor() {
    super(
      'create-workspace',
      'Create Workspace',
      'Tworzy nowy workspace na podstawie danych z wybranych węzłów'
    );
    this.defaultConfig = defaultConfig;
  }

  ViewComponent: React.FC<PluginProps> = ({ config, nodeId, onResponseChange }) => {
    const { createWorkspace, setCurrentWorkspace } = useWorkspaceStore();
    const { toast } = useToast();
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceCreated, setWorkspaceCreated] = useState(false);
    
    const pluginConfig = { ...defaultConfig, ...config };
    
    // Function to get node response by ID
    const getNodeResponse = (nodeId: string): string => {
      // Import hook dynamically using ES imports
      const { useScenarioStore } = window as any;
      return useScenarioStore?.getState()?.nodeResponses[nodeId] || '';
    };
    
    // Generate workspace name from template and responses
    const generateWorkspaceName = (): string => {
      let name = pluginConfig.nameTemplate;
      
      // Replace {{domain}} with domain from URL
      const urlResponse = getNodeResponse(pluginConfig.urlNodeId);
      if (urlResponse) {
        const domain = extractDomainFromUrl(urlResponse);
        name = name.replace(/\{\{domain\}\}/g, domain);
      }
      
      // Replace other variables
      name = name.replace(/\{\{url\}\}/g, getNodeResponse(pluginConfig.urlNodeId));
      name = name.replace(/\{\{audience\}\}/g, getNodeResponse(pluginConfig.audienceNodeId));
      name = name.replace(/\{\{businessGoal\}\}/g, getNodeResponse(pluginConfig.businessGoalNodeId));
      
      return name;
    };
    
    // Create workspace context from node responses
    const createWorkspaceContext = () => {
      const context: Record<string, any> = {};
      
      // Add core context values if configured
      if (pluginConfig.includeUrl && pluginConfig.urlNodeId) {
        context.url = getNodeResponse(pluginConfig.urlNodeId);
      }
      
      if (pluginConfig.includeAudience && pluginConfig.audienceNodeId) {
        context.audience = getNodeResponse(pluginConfig.audienceNodeId);
      }
      
      if (pluginConfig.includeBusinessGoal && pluginConfig.businessGoalNodeId) {
        context.businessGoal = getNodeResponse(pluginConfig.businessGoalNodeId);
      }
      
      // Add additional context keys
      pluginConfig.additionalContextKeys.forEach(({nodeId, key}) => {
        if (nodeId && key) {
          context[key] = getNodeResponse(nodeId);
        }
      });
      
      return context;
    };
    
    // Handle workspace creation
    const handleCreateWorkspace = () => {
      const name = workspaceName || generateWorkspaceName();
      const context = createWorkspaceContext();
      
      // Create workspace
      const workspaceId = createWorkspace(
        name,
        pluginConfig.workspaceType,
        `Workspace created from scenario node ${nodeId}`,
        context
      );
      
      // Set as current workspace
      setCurrentWorkspace(workspaceId);
      
      // Create initial scenario if configured
      if (pluginConfig.autoCreateScenario) {
        // Access store through global window to avoid imports
        const workspaceStore = (window as any).workspaceStore;
        if (workspaceStore?.getState) {
          workspaceStore.getState().createScenarioInWorkspace(
            workspaceId, 
            `Scenariusz dla ${name}`
          );
        }
      }
      
      // Set response and update state
      const response = `Utworzono nowy workspace "${name}" z kontekstem:\n${JSON.stringify(context, null, 2)}`;
      if (onResponseChange) {
        onResponseChange(response);
      }
      
      setWorkspaceCreated(true);
      
      toast({
        title: "Workspace utworzony!",
        description: `Utworzono nowy workspace "${name}"`,
      });
    };
    
    if (workspaceCreated) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-700">
            <p className="font-medium">Workspace został utworzony!</p>
            <p className="text-sm mt-1">
              Możesz teraz przejść do zakładki Workspace, aby z nim pracować.
            </p>
          </div>
          
          <Button 
            onClick={() => setWorkspaceCreated(false)}
            variant="outline"
            className="w-full"
          >
            Utwórz kolejny workspace
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Nazwa workspace (opcjonalnie)</Label>
          <p className="text-xs text-slate-500 mt-1">
            Pozostaw puste, aby użyć szablonu: {pluginConfig.nameTemplate}
          </p>
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder={generateWorkspaceName()}
            className="mt-1.5"
          />
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm font-medium">Podgląd kontekstu workspace:</p>
          <div className="mt-2 text-xs bg-white p-2 rounded border">
            <pre>{JSON.stringify(createWorkspaceContext(), null, 2)}</pre>
          </div>
        </div>
        
        <Button 
          onClick={handleCreateWorkspace}
          className="w-full"
        >
          Utwórz nowy workspace
        </Button>
      </div>
    );
  };

  ConfigComponent: React.FC<PluginProps> = ({ config, onConfigChange }) => {
    const pluginConfig = { ...defaultConfig, ...config };
    const [newNodeId, setNewNodeId] = useState("");
    const [newKey, setNewKey] = useState("");
    
    // Get all available node IDs
    const getAvailableNodeIds = (): string[] => {
      // Import hook dynamically using ES imports
      const { useScenarioStore } = window as any;
      return Object.keys(useScenarioStore?.getState()?.nodes || {});
    };
    
    const handleChange = (key: keyof CreateWorkspacePluginConfig, value: any) => {
      if (onConfigChange) {
        onConfigChange({ [key]: value });
      }
    };
    
    const handleAddContextKey = () => {
      if (newNodeId && newKey && onConfigChange) {
        const updatedKeys = [
          ...(pluginConfig.additionalContextKeys || []),
          { nodeId: newNodeId, key: newKey }
        ];
        onConfigChange({ additionalContextKeys: updatedKeys });
        setNewNodeId("");
        setNewKey("");
      }
    };
    
    const handleRemoveContextKey = (index: number) => {
      if (onConfigChange) {
        const updatedKeys = [...pluginConfig.additionalContextKeys];
        updatedKeys.splice(index, 1);
        onConfigChange({ additionalContextKeys: updatedKeys });
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Szablon nazwy workspace</Label>
          <p className="text-xs text-slate-500 mt-1">
            Możesz użyć  {`{{${'domain'}}}`} etc
          </p>
          <Input
            value={pluginConfig.nameTemplate}
            onChange={(e) => handleChange('nameTemplate', e.target.value)}
            placeholder="Analiza {{domain}}"
            className="mt-1.5"
          />
        </div>
        
        <div>
          <Label>Typ workspace</Label>
          <Select 
            value={pluginConfig.workspaceType} 
            onValueChange={(value) => handleChange('workspaceType', value)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Wybierz typ workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Analiza strony WWW</SelectItem>
              <SelectItem value="audience">Grupa docelowa</SelectItem>
              <SelectItem value="business">Cel biznesowy</SelectItem>
              <SelectItem value="general">Ogólny</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch 
              checked={pluginConfig.autoCreateScenario}
              onCheckedChange={(checked) => handleChange('autoCreateScenario', checked)}
            />
            <Label>Automatycznie utwórz początkowy scenariusz</Label>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Label className="font-medium">Mapowanie węzłów na kontekst workspace</Label>
          
          <div className="mt-4 space-y-3">
            <div>
              <Label>URL strony (węzeł)</Label>
              <Select 
                value={pluginConfig.urlNodeId} 
                onValueChange={(value) => handleChange('urlNodeId', value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Wybierz węzeł" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak</SelectItem>
                  {getAvailableNodeIds().map(id => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center mt-2 gap-2">
                <Switch 
                  checked={pluginConfig.includeUrl}
                  onCheckedChange={(checked) => handleChange('includeUrl', checked)}
                />
                <Label className="text-sm">Dołącz URL do kontekstu workspace</Label>
              </div>
            </div>
            
            <div>
              <Label>Grupa docelowa (węzeł)</Label>
              <Select 
                value={pluginConfig.audienceNodeId} 
                onValueChange={(value) => handleChange('audienceNodeId', value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Wybierz węzeł" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak</SelectItem>
                  {getAvailableNodeIds().map(id => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center mt-2 gap-2">
                <Switch 
                  checked={pluginConfig.includeAudience}
                  onCheckedChange={(checked) => handleChange('includeAudience', checked)}
                />
                <Label className="text-sm">Dołącz grupę docelową do kontekstu workspace</Label>
              </div>
            </div>
            
            <div>
              <Label>Cel biznesowy (węzeł)</Label>
              <Select 
                value={pluginConfig.businessGoalNodeId} 
                onValueChange={(value) => handleChange('businessGoalNodeId', value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Wybierz węzeł" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak</SelectItem>
                  {getAvailableNodeIds().map(id => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center mt-2 gap-2">
                <Switch 
                  checked={pluginConfig.includeBusinessGoal}
                  onCheckedChange={(checked) => handleChange('includeBusinessGoal', checked)}
                />
                <Label className="text-sm">Dołącz cel biznesowy do kontekstu workspace</Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Label className="font-medium">Dodatkowe klucze kontekstu workspace</Label>
          
          <div className="grid grid-cols-5 gap-2 mt-2">
            <div className="col-span-2">
              <Label className="text-xs">Węzeł</Label>
              <Select 
                value={newNodeId} 
                onValueChange={setNewNodeId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Wybierz węzeł" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableNodeIds().map(id => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label className="text-xs">Nazwa klucza</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Np. keywords"
                className="mt-1"
              />
            </div>
            
            <div className="pt-6">
              <Button 
                onClick={handleAddContextKey}
                disabled={!newNodeId || !newKey}
                className="w-full"
              >
                Dodaj
              </Button>
            </div>
          </div>
          
          {pluginConfig.additionalContextKeys.length > 0 && (
            <div className="mt-3 space-y-2">
              {pluginConfig.additionalContextKeys.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                  <div>
                    <span className="font-medium">{item.key}:</span> {item.nodeId}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveContextKey(index)}
                    className="h-7 w-7 p-0"
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  ResultComponent: React.FC<PluginProps> = ({ nodeId }) => {
    // Access store through window object
    const nodeResponses = (window as any).useScenarioStore?.getState()?.nodeResponses || {};
    const response = nodeId ? nodeResponses[nodeId] : null;
    
    if (!response) {
      return (
        <div className="text-center py-6 text-slate-500">
          Brak zapisanej odpowiedzi dla tego węzła.
        </div>
      );
    }
    
    return (
      <div className="p-3 bg-slate-50 rounded-md border whitespace-pre-wrap">
        {response}
      </div>
    );
  };

  processNode(node: Node, response?: string): { node: Node; result: any; } {
    // Workspace creation is handled in the ViewComponent
    return {
      node,
      result: response
    };
  }
}

export default new CreateWorkspacePlugin();

function useWorkspaceStore(): { createWorkspace: any; setCurrentWorkspace: any; } {
    throw new Error('Function not implemented.');
}
