/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Plugin System
 * Core plugin system implementation
 */
import React, { useState, useEffect, createContext, useContext } from 'react';

// Plugin registry types
export interface PluginDefinition {
  key: string;
  name: string;
  description: string;
  version: string;
  component: React.ComponentType<any>;
  settings?: Record<string, any>;
}

interface PluginSystemContextType {
  pluginRegistry: Record<string, PluginDefinition>;
  getPluginComponent: (key: string) => React.ComponentType<any> | null;
  registerPlugin: (plugin: PluginDefinition) => void;
}

// Create context
const PluginSystemContext = createContext<PluginSystemContextType>({
  pluginRegistry: {},
  getPluginComponent: () => null,
  registerPlugin: () => {}
});

// Plugin system provider
export const PluginSystemProvider: React.FC<{
  children: React.ReactNode;
  initialPlugins?: PluginDefinition[];
}> = ({ children, initialPlugins = [] }) => {
  // Store registered plugins
  const [pluginRegistry, setPluginRegistry] = useState<Record<string, PluginDefinition>>({});
  
  // Register initial plugins
  useEffect(() => {
    const registry: Record<string, PluginDefinition> = {};
    
    initialPlugins.forEach(plugin => {
      registry[plugin.key] = plugin;
    });
    
    setPluginRegistry(registry);
  }, [initialPlugins]);
  
  // Get plugin component by key
  const getPluginComponent = (key: string) => {
    const plugin = pluginRegistry[key];
    return plugin ? plugin.component : null;
  };
  
  // Register a new plugin
  const registerPlugin = (plugin: PluginDefinition) => {
    setPluginRegistry(prev => ({
      ...prev,
      [plugin.key]: plugin
    }));
  };
  
  // Context value
  const value = {
    pluginRegistry,
    getPluginComponent,
    registerPlugin
  };
  
  return (
    <PluginSystemContext.Provider value={value}>
      {children}
    </PluginSystemContext.Provider>
  );
};

// Hook for accessing plugin system
export function usePlugins() {
  return useContext(PluginSystemContext);
}

// Default export
export default PluginSystemProvider;