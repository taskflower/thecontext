/**
 * Plugin system context provider
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PluginContextValue,
  PluginRegistration,
  PluginRegistry
} from './types';
import {
  registerPlugin as registerPluginInRegistry,
  unregisterPlugin as unregisterPluginInRegistry,
  getPlugin as getPluginFromRegistry,
  getAllPlugins as getAllPluginsFromRegistry,
  resetPluginRegistry
} from './registry';

// Create context for plugin system
const PluginContext = createContext<PluginContextValue>({
  plugins: {},
  registerPlugin: () => {},
  unregisterPlugin: () => {},
  getPlugin: () => undefined,
  getPluginComponent: () => undefined,
});

export interface PluginProviderProps {
  children: React.ReactNode;
  initialPlugins?: PluginRegistration[];
}

/**
 * Plugin system provider component
 */
export const PluginProvider: React.FC<PluginProviderProps> = ({ 
  children, 
  initialPlugins = [] 
}) => {
  // State to track plugin registrations
  const [plugins, setPlugins] = useState<PluginRegistry>({});
  
  // Register initial plugins
  useEffect(() => {
    // Reset plugin registry to avoid duplicates
    resetPluginRegistry();
    
    // Register each initial plugin
    initialPlugins.forEach(plugin => {
      registerPluginInRegistry(plugin);
    });
    
    // Update state with all plugins
    setPlugins(getAllPluginsFromRegistry().reduce((acc, plugin) => {
      acc[plugin.manifest.id] = plugin;
      return acc;
    }, {} as PluginRegistry));
  }, []);
  
  // Register a plugin
  const registerPlugin = (plugin: PluginRegistration) => {
    registerPluginInRegistry(plugin);
    
    // Update state
    setPlugins(prevPlugins => ({
      ...prevPlugins,
      [plugin.manifest.id]: plugin
    }));
  };
  
  // Unregister a plugin
  const unregisterPlugin = (pluginId: string) => {
    unregisterPluginInRegistry(pluginId);
    
    // Update state
    setPlugins(prevPlugins => {
      const newPlugins = { ...prevPlugins };
      delete newPlugins[pluginId];
      return newPlugins;
    });
  };
  
  // Get a plugin by ID
  const getPlugin = (pluginId: string) => {
    return getPluginFromRegistry(pluginId);
  };
  
  // Get a plugin component
  const getPluginComponent = (pluginId: string, componentId: string) => {
    const plugin = getPluginFromRegistry(pluginId);
    if (plugin && plugin.components && componentId in plugin.components) {
      return plugin.components[componentId];
    }
    return undefined;
  };
  
  // Context value
  const value: PluginContextValue = {
    plugins,
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    getPluginComponent,
  };
  
  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};

/**
 * Hook to use the plugin system
 */
export const usePlugins = () => useContext(PluginContext);

export default PluginContext;