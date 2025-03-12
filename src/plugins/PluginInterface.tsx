/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/PluginInterface.ts
import React from 'react';
import { Node } from '../stores/nodeStore';


// Common props for all plugin components
export interface PluginComponentProps {
  nodeId?: string;
  config: Record<string, any>;
  onConfigChange?: (updates: Record<string, any>) => void;
}

// Result of plugin processing
export interface PluginProcessResult {
  output: string;
  result: any;
}

// Input for plugin processing
export interface PluginProcessInput {
  node: Node;
  input: string;
  config: Record<string, any>;
}

// Core plugin interface
export interface PluginModule {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Default configuration
  defaultConfig: Record<string, any>;
  
  // UI Components
  ViewComponent: React.FC<PluginComponentProps>;
  ConfigComponent: React.FC<PluginComponentProps>;
  ResultComponent: React.FC<PluginComponentProps>;
  
  // Processing methods
  processNode?: (input: PluginProcessInput) => Promise<PluginProcessResult> | PluginProcessResult;
}

// Base class for plugin implementation
export abstract class PluginBase implements PluginModule {
  id: string;
  name: string;
  description: string;
  version: string;
  defaultConfig: Record<string, any>;
  
  constructor(options: {
    id: string;
    name: string;
    description?: string;
    version?: string;
    defaultConfig?: Record<string, any>;
  }) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description || '';
    this.version = options.version || '1.0.0';
    this.defaultConfig = options.defaultConfig || {};
  }
  
  // UI Components to be implemented by specific plugins
  abstract ViewComponent: React.FC<PluginComponentProps>;
  abstract ConfigComponent: React.FC<PluginComponentProps>;
  abstract ResultComponent: React.FC<PluginComponentProps>;
  
  // Default implementation of processNode (can be overridden)
  processNode(input: PluginProcessInput): PluginProcessResult {
    return {
      output: input.input, // Pass through by default
      result: null
    };
  }
}

// Type to help with plugin registration
export type PluginFactory = () => PluginModule;

// Helper to load plugins dynamically
export const loadPlugins = async (): Promise<PluginModule[]> => {
  if (typeof window === 'undefined' || !import.meta.env.DEV) return [];
  
  try {
    // Use Vite's dynamic import with glob pattern to find all plugins
    const modules = import.meta.glob('../plugins/*/index.ts', { eager: true });
    const plugins: PluginModule[] = [];
    
    for (const path in modules) {
      const module = modules[path] as { default?: PluginModule | PluginFactory };
      
      if (module.default) {
        // Handle both direct plugin exports and factory functions
        const plugin = typeof module.default === 'function' 
          ? module.default() 
          : module.default;
          
        if (plugin && plugin.id && plugin.name) {
          plugins.push(plugin);
        }
      }
    }
    
    return plugins;
  } catch (error) {
    console.error('Error loading plugins:', error);
    return [];
  }
};

// Plugin API for accessing store functions safely
export interface PluginAPI {
  workspace: {
    getContext: (workspaceId: string) => Record<string, any> | null;
    updateContext: (workspaceId: string, updates: Record<string, any>) => void;
  };
  scenario: {
    getScenario: (scenarioId: string) => any;
  };
  node: {
    getNode: (nodeId: string) => Node | null;
    updateNodeData: (nodeId: string, data: any) => void;
  };
  execution: {
    getResults: (executionId: string) => Record<string, any> | null;
  };
}

// Plugin context provider for React components
export const PluginContext = React.createContext<{
  api: PluginAPI | null;
}>({
  api: null
});

// Hook for plugins to access the API
export const usePluginAPI = (): PluginAPI => {
  const context = React.useContext(PluginContext);
  
  if (!context.api) {
    throw new Error('usePluginAPI must be used within a PluginProvider');
  }
  
  return context.api;
};

// Provider component for plugin API
// Fix the syntax error in your PluginProvider component
export const PluginProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [api, setApi] = React.useState<PluginAPI | null>(null);
  
  React.useEffect(() => {
    // Access the API from window
    if (typeof window !== 'undefined' && (window as any).storeAPI) {
      setApi((window as any).storeAPI);
    }
  }, []);
  
  return (
    <PluginContext.Provider value={{ api }}>
      {children}
    </PluginContext.Provider>
  );
};