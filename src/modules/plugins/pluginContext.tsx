// src/modules/plugins/pluginContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import useDynamicComponentStore from './pluginsStore';
import { PluginComponentProps, Plugin, AppContextData } from './types';
import { discoverAndLoadComponents } from './pluginsDiscovery';

// Define the interface for our plugin context
interface PluginContextType {
  // Plugin registration
  registerPlugin: (key: string, component: React.ComponentType<PluginComponentProps>) => void;
  unregisterPlugin: (key: string) => void;
  
  // Plugin state management
  getPluginComponent: (key: string) => React.ComponentType<PluginComponentProps> | null;
  getPluginKeys: () => string[];
  getAllPlugins: () => Plugin[];
  
  // Plugin data management
  setPluginData: (key: string, data: unknown) => void;
  getPluginData: (key: string) => unknown;
  
  // Plugin state (enabled/disabled)
  isPluginEnabled: (key: string) => boolean;
  togglePlugin: (key: string) => void;
  
  // Loaded state
  isLoaded: boolean;
}

// Create the context with a default value
const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Plugin provider component
export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pluginState, setPluginState] = useState<Record<string, boolean>>({});
  
  // Access the Zustand store
  const store = useDynamicComponentStore();
  const getComponentKeys = store.getComponentKeys;
  
  // Initialize plugins
  useEffect(() => {
    const initPlugins = async () => {
      // Discover and load plugins
      await discoverAndLoadComponents();
      
      // Initialize plugin state
      const keys = getComponentKeys();
      const initialState = Object.fromEntries(
        keys.map(key => [key, true])
      );
      
      setPluginState(initialState);
      setIsLoaded(true);
    };
    
    initPlugins();
  }, [getComponentKeys]);
  
  // Memoize plugin registration functions to prevent re-renders
  const registerPlugin = useCallback((key: string, component: React.ComponentType<PluginComponentProps>) => {
    store.registerComponent(key, component);
    
    // Update plugin state if this is a new plugin
    setPluginState(prev => ({
      ...prev,
      [key]: prev[key] !== undefined ? prev[key] : true
    }));
  }, [store]);
  
  const unregisterPlugin = useCallback((key: string) => {
    store.unregisterComponent(key);
    
    // Update plugin state
    setPluginState(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, [store]);
  
  // Memoize plugin state management
  const isPluginEnabled = useCallback((key: string) => {
    return pluginState[key] !== false;
  }, [pluginState]);
  
  const togglePlugin = useCallback((key: string) => {
    setPluginState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);
  
  // Memoize getters to prevent unnecessary re-renders
  const getPluginComponent = useCallback((key: string) => {
    return store.getComponent(key);
  }, [store]);
  
  const getPluginData = useCallback((key: string) => {
    return store.getComponentData(key);
  }, [store]);
  
  const setPluginData = useCallback((key: string, data: unknown) => {
    store.setComponentData(key, data);
  }, [store]);
  
  // Memoize getAllPlugins to prevent unnecessary re-renders
  const getAllPlugins = useCallback((): Plugin[] => {
    return getComponentKeys().map(key => ({
      key,
      enabled: isPluginEnabled(key)
    }));
  }, [getComponentKeys, isPluginEnabled]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<PluginContextType>(() => ({
    registerPlugin,
    unregisterPlugin,
    getPluginComponent,
    getPluginKeys: getComponentKeys,
    getAllPlugins,
    setPluginData,
    getPluginData,
    isPluginEnabled,
    togglePlugin,
    isLoaded
  }), [
    registerPlugin,
    unregisterPlugin,
    getPluginComponent,
    getComponentKeys,
    getAllPlugins,
    setPluginData,
    getPluginData,
    isPluginEnabled,
    togglePlugin,
    isLoaded
  ]);
  
  return (
    <PluginContext.Provider value={contextValue}>
      {children}
    </PluginContext.Provider>
  );
};

// Custom hook for accessing plugin context
export const usePlugins = (): PluginContextType => {
  const context = useContext(PluginContext);
  
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  
  return context;
};

// Export direct access to the plugin registry for external usage
// This replaces the global window.__DYNAMIC_COMPONENTS__ pattern
export const PluginRegistry = {
  register: (key: string, component: React.ComponentType<PluginComponentProps>) => {
    useDynamicComponentStore.getState().registerComponent(key, component);
  },
  unregister: (key: string) => {
    useDynamicComponentStore.getState().unregisterComponent(key);
  },
  getComponent: (key: string) => {
    return useDynamicComponentStore.getState().getComponent(key);
  },
  setData: (key: string, data: unknown) => {
    useDynamicComponentStore.getState().setComponentData(key, data);
  },
  getData: (key: string) => {
    return useDynamicComponentStore.getState().getComponentData(key);
  }
};