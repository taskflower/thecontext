// src/plugins/workspace-context-updater/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  PluginBase, 
  PluginComponentProps, 
  PluginProcessInput, 
  PluginProcessResult,
  usePluginAPI
} from '../PluginInterface';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Database } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkspaceStore } from '@/stores/workspaceStore';


// Plugin config type
interface ContextUpdaterConfig {
  contextKey: string;
  valueType: 'string' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

class WorkspaceContextUpdaterPlugin extends PluginBase {
  constructor() {
    super({
      id: 'workspace-context-updater',
      name: 'Workspace Context Updater',
      description: 'Update or add data to the workspace context',
      version: '1.0.0',
      defaultConfig: {
        contextKey: 'customData',
        valueType: 'string',
        defaultValue: '',
        description: 'Data added by plugin'
      }
    });
  }
  
  // Configuration component
  ConfigComponent: React.FC<PluginComponentProps> = ({ config, onConfigChange = () => {} }) => {
    const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="contextKey">Context key name</Label>
          <Input 
            id="contextKey"
            value={pluginConfig.contextKey} 
            onChange={(e) => onConfigChange({ contextKey: e.target.value })}
            placeholder="e.g. keywords, audience, customData"
          />
        </div>
        
        <div>
          <Label htmlFor="valueType">Value type</Label>
          <Select 
            value={pluginConfig.valueType} 
            onValueChange={(value) => onConfigChange({ valueType: value })}
          >
            <SelectTrigger id="valueType">
              <SelectValue placeholder="Select value type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Text</SelectItem>
              <SelectItem value="array">List (comma separated)</SelectItem>
              <SelectItem value="object">JSON Object</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="defaultValue">Default value</Label>
          <Textarea 
            id="defaultValue"
            value={pluginConfig.defaultValue} 
            onChange={(e) => onConfigChange({ defaultValue: e.target.value })}
            placeholder={
              pluginConfig.valueType === 'array' ? 'item1, item2, item3' : 
              pluginConfig.valueType === 'object' ? '{"key": "value"}' : 
              'text value'
            }
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Key description</Label>
          <Input 
            id="description"
            value={pluginConfig.description} 
            onChange={(e) => onConfigChange({ description: e.target.value })}
            placeholder="Description of what this key contains"
          />
        </div>
      </div>
    );
  };
  
  // Main view component
  ViewComponent: React.FC<PluginComponentProps> = ({ 
    config, 
   
  }) => {
    const { getCurrentWorkspace } = useWorkspaceStore();
    const api = usePluginAPI();
    
    const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
    const [currentValue, setCurrentValue] = useState(pluginConfig.defaultValue || '');
    const [status, setStatus] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({
      message: '', type: null
    });
    
    // Get the current workspace
    const workspace = getCurrentWorkspace();
    
    // Load existing value if available
    useEffect(() => {
      if (workspace && pluginConfig.contextKey) {
        const context = api.workspace.getContext(workspace.id);
        
        if (context && pluginConfig.contextKey in context) {
          const existingValue = context[pluginConfig.contextKey];
          
          // Convert value to string format for editing
          if (typeof existingValue === 'string') {
            setCurrentValue(existingValue);
          } else if (Array.isArray(existingValue)) {
            setCurrentValue(existingValue.join(', '));
          } else if (typeof existingValue === 'object') {
            setCurrentValue(JSON.stringify(existingValue, null, 2));
          }
          
          setStatus({
            message: 'Loaded existing value from workspace context',
            type: 'info'
          });
        }
      }
    }, [pluginConfig.contextKey, workspace?.id]);
    
    // Function to update workspace context
    const updateWorkspaceContext = () => {
      if (!workspace) {
        setStatus({
          message: 'No active workspace found',
          type: 'error'
        });
        return;
      }
      
      try {
        // Convert value to appropriate type
        let valueToSave: string | string[] | object = currentValue;
        
        if (pluginConfig.valueType === 'array') {
          valueToSave = currentValue.split(',').map(item => item.trim()).filter(Boolean);
        } else if (pluginConfig.valueType === 'object') {
          try {
            valueToSave = JSON.parse(currentValue);
          } catch (e) {
            setStatus({
              message: 'Error parsing JSON. Check the format.',
              type: 'error'
            });
            return;
          }
        }
        
        // Update workspace context
        api.workspace.updateContext(workspace.id, {
          [pluginConfig.contextKey]: valueToSave
        });
        
        setStatus({
          message: 'Successfully saved to workspace context',
          type: 'success'
        });
      } catch (error) {
        console.error('Error updating context:', error);
        setStatus({
          message: 'Error updating context',
          type: 'error'
        });
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5" />
          <h3 className="text-lg font-medium">Update workspace context</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 border border-blue-100 bg-blue-50 rounded p-3">
          <span>Context key:</span>
          <span className="font-semibold">{pluginConfig.contextKey}</span>
          <span>({
            pluginConfig.valueType === 'string' ? 'text' : 
            pluginConfig.valueType === 'array' ? 'list' : 'JSON object'
          })</span>
        </div>
        
        <div>
          <Label htmlFor="valueInput">
            {pluginConfig.description || 'Enter value to save in context'}
          </Label>
          <Textarea 
            id="valueInput"
            className="mt-1 font-mono"
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={
              pluginConfig.valueType === 'array' ? 'item1, item2, item3' : 
              pluginConfig.valueType === 'object' ? '{"key": "value"}' : 
              'text value'
            }
            rows={6}
          />
        </div>
        
        {status.type && (
          <Alert className={
            status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            onClick={updateWorkspaceContext}
            disabled={!workspace}
          >
            <Save className="h-4 w-4 mr-2" />
            Save to workspace
          </Button>
        </div>
      </div>
    );
  };
  
  // Results component
  ResultComponent: React.FC<PluginComponentProps> = ({ config }) => {
    const { getCurrentWorkspace } = useWorkspaceStore();
    const api = usePluginAPI();
    
    const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
    const [contextValue, setContextValue] = useState<any>(null);
    
    // Get the current workspace
    const workspace = getCurrentWorkspace();
    
    // Load current value from context
    useEffect(() => {
      if (workspace && pluginConfig.contextKey) {
        const context = api.workspace.getContext(workspace.id);
        
        if (context && pluginConfig.contextKey in context) {
          setContextValue(context[pluginConfig.contextKey]);
        }
      }
    }, [pluginConfig.contextKey, workspace?.id]);
    
    if (!contextValue) {
      return (
        <div className="p-4 text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
          No data found for key <span className="font-mono">{pluginConfig.contextKey}</span> in workspace context.
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Database className="h-4 w-4 text-blue-500" />
          Saved in context: <span className="font-mono">{pluginConfig.contextKey}</span>
        </h3>
        
        {typeof contextValue === 'string' ? (
          <div className="p-3 bg-slate-50 rounded-md border text-sm">
            {contextValue}
          </div>
        ) : Array.isArray(contextValue) ? (
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-md border">
            {contextValue.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <pre className="p-3 bg-slate-50 rounded-md border text-xs font-mono overflow-x-auto">
            {JSON.stringify(contextValue, null, 2)}
          </pre>
        )}
      </div>
    );
  };
  
  // Process node with this plugin
  async processNode(input: PluginProcessInput): Promise<PluginProcessResult> {
    const {input: nodeInput, config } = input;
    
    // Get workspace ID from node's scenario
    const workspace = useWorkspaceStore.getState().getCurrentWorkspace();
    
    if (!workspace) {
      return {
        output: "Error: No active workspace",
        result: null
      };
    }
    
    try {
      const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
      
      // Prepare value based on type
      let valueToSave: string | string[] | object = nodeInput;
      
      if (pluginConfig.valueType === 'array') {
        valueToSave = nodeInput.split(',').map((item: string) => item.trim()).filter(Boolean);
      } else if (pluginConfig.valueType === 'object') {
        try {
          valueToSave = JSON.parse(nodeInput);
        } catch (e) {
          return {
            output: "Error: Invalid JSON format",
            result: { error: "Invalid JSON format" }
          };
        }
      }
      
      // Update workspace context
      useWorkspaceStore.getState().updateWorkspaceContext(
        workspace.id,
        { [pluginConfig.contextKey]: valueToSave }
      );
      
      const output = `Updated context key "${pluginConfig.contextKey}" in workspace "${workspace.name}"`;
      
      return {
        output,
        result: {
          key: pluginConfig.contextKey,
          value: valueToSave
        }
      };
    } catch (error) {
      console.error('Error in workspace context updater plugin:', error);
      return {
        output: `Error updating workspace context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        result: { error }
      };
    }
  }
}

export default new WorkspaceContextUpdaterPlugin();