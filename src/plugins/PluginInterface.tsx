/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/PluginInterface.tsx
import React, { createContext, useContext, useState } from 'react';
import { usePluginStore } from '@/stores/pluginStore';
import { useNodeStore } from '@/stores/nodeStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';


// Plugin API interface
export interface PluginAPI {
  getNodeData: () => any;
  updateNodeData: (updates: any) => void;
  getPluginConfig: () => any;
  updatePluginConfig: (updates: any) => void;
  setResult: (result: any) => void;
  getResult: () => any;
  
  // Add workspace API
  workspace: {
    getContext: (workspaceId: string) => any;
    updateContext: (workspaceId: string, updates: any) => void;
  };
}

// Plugin module interface
export interface PluginModule {
  id: string;
  name: string;
  description: string;
  version: string;
  activateByDefault?: boolean;
  ViewComponent: React.ComponentType<any>;
  ConfigComponent?: React.ComponentType<any>;
  ResultComponent?: React.ComponentType<any>;
  defaultConfig?: Record<string, any>;
  processNode?: (params: PluginProcessInput) => Promise<PluginProcessResult> | PluginProcessResult;
}

// Plugin process input interface
export interface PluginProcessInput {
  node?: any;
  input: string;
  config: any;
}

// Plugin process result interface
export interface PluginProcessResult {
  output: string;
  result: any;
}

// Plugin component props interface
export interface PluginComponentProps {
  nodeId?: string;
  config?: any;
  onConfigChange?: (updates: any) => void;
}

// Context for providing plugin API to components
const PluginContext = createContext<PluginAPI | null>(null);

// Props for PluginProvider
export interface PluginProviderProps {
  pluginId?: string;
  nodeId?: string;
  children: React.ReactNode;
}

// Create a Plugin Provider component
export const PluginProvider: React.FC<PluginProviderProps> = ({ 
  pluginId, 
  nodeId, 
  children 
}) => {
  const pluginStore = usePluginStore();
  const nodeStore = useNodeStore();
  const workspaceStore = useWorkspaceStore();
  
  // Get node and plugin state
  const node = nodeId ? nodeStore.getNode(nodeId) : null;
  const pluginState = pluginId ? pluginStore.getPluginState(pluginId) : null;
  
  // Create plugin API
  const api: PluginAPI = {
    getNodeData: () => {
      return node ? node.data : null;
    },
    
    updateNodeData: (updates) => {
      if (nodeId) {
        nodeStore.updateNodeData(nodeId, updates);
      }
    },
    
    getPluginConfig: () => {
      if (nodeId && node?.data.pluginConfig) {
        return node.data.pluginConfig;
      }
      return pluginState?.config || {};
    },
    
    updatePluginConfig: (updates) => {
      if (nodeId && pluginId) {
        nodeStore.updateNodePluginConfig(nodeId, updates);
      } else if (pluginId) {
        pluginStore.updatePluginConfig(pluginId, updates);
      }
    },
    
    setResult: (result) => {
      if (pluginId) {
        pluginStore.updatePluginResult(pluginId, result);
      }
    },
    
    getResult: () => {
      return pluginState?.result || null;
    },
    
    // Workspace API
    workspace: {
      getContext: (workspaceId) => {
        return workspaceStore.getWorkspaceContext(workspaceId);
      },
      updateContext: (workspaceId, updates) => {
        workspaceStore.updateWorkspaceContext(workspaceId, updates);
      }
    }
  };
  
  return (
    <PluginContext.Provider value={api}>
      {children}
    </PluginContext.Provider>
  );
};

// Hook for accessing plugin API
export const usePluginAPI = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginAPI must be used within a PluginProvider');
  }
  return context;
};

// Plugin base class that plugins can extend
export abstract class PluginBase implements PluginModule {
  id: string;
  name: string;
  description: string;
  version: string;
  activateByDefault?: boolean;
  defaultConfig?: Record<string, any>;
  
  abstract ViewComponent: React.FC<PluginComponentProps>;
  abstract ConfigComponent?: React.FC<PluginComponentProps>;
  abstract ResultComponent?: React.FC<PluginComponentProps>;
  
  constructor(options: {
    id: string;
    name: string;
    description: string;
    version: string;
    activateByDefault?: boolean;
    defaultConfig?: Record<string, any>;
  }) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.version = options.version;
    this.activateByDefault = options.activateByDefault || false;
    this.defaultConfig = options.defaultConfig || {};
  }
  
  processNode(input: PluginProcessInput): PluginProcessResult {
    return {
      output: input.input,
      result: null
    };
  }
}

// Plugin container component
export interface PluginContainerProps {
  pluginId: string;
  nodeId?: string;
}

export const PluginContainer: React.FC<PluginContainerProps> = ({ 
  pluginId,
  nodeId
}) => {
  const [error, setError] = useState<string | null>(null);
  const { plugins } = usePluginStore();
  
  const plugin = plugins[pluginId];
  
  if (!plugin) {
    return <div className="p-4 bg-red-50 text-red-700 rounded">Plugin not found: {pluginId}</div>;
  }
  
  if (!plugin.ViewComponent) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
        This plugin doesn't provide a view component
      </div>
    );
  }
  
  try {
    const ViewComponent = plugin.ViewComponent;
    
    return (
      <div className="plugin-container border rounded-md overflow-hidden">
        {error ? (
          <div className="p-4 bg-red-50 text-red-700">{error}</div>
        ) : (
          <ViewComponent nodeId={nodeId} />
        )}
      </div>
    );
  } catch (err) {
    setError(`Error rendering plugin: ${err instanceof Error ? err.message : String(err)}`);
    return <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>;
  }
};

// Dynamic plugin loading
export const loadPlugins = async (): Promise<PluginModule[]> => {
  try {
    // Use Vite's import.meta.glob to load all plugin modules
    const modules = import.meta.glob('./*/index.{ts,tsx}', { eager: true });
    const plugins: PluginModule[] = [];
    
    for (const path in modules) {
      try {
        const module = modules[path] as any;
        if (module && module.default) {
          const plugin = module.default as PluginModule;
          if (plugin.id && plugin.name) {
            plugins.push(plugin);
          }
        }
      } catch (err) {
        console.error(`Error loading plugin from ${path}:`, err);
      }
    }
    
    return plugins;
  } catch (err) {
    console.error('Error loading plugins:', err);
    return [];
  }
};