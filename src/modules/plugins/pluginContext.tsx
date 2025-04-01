// src/modules/plugins/pluginContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import useDynamicComponentStore from './pluginsStore';
import { PluginComponentProps, Plugin, PluginType } from './types';
import { discoverAndLoadComponents } from './pluginsDiscovery';

// Define the interface for our plugin context
interface PluginContextType {
  // Plugin registration
  registerPlugin: (key: string, component: React.ComponentType<PluginComponentProps>, type?: PluginType) => void;
  unregisterPlugin: (key: string) => void;
  
  // Plugin state management
  getPluginComponent: (key: string) => React.ComponentType<PluginComponentProps> | null;
  getPluginKeys: () => string[];
  getPluginKeysByType: (type: PluginType) => string[];
  getAllPlugins: () => Plugin[];
  getPluginsByType: (type: PluginType) => Plugin[];
  
  // Plugin data management
  setPluginData: (key: string, data: unknown) => void;
  getPluginData: (key: string) => unknown;
  
  // Plugin state (enabled/disabled)
  isPluginEnabled: (key: string) => boolean;
  togglePlugin: (key: string) => void;
  
  // Plugin type management
  getPluginType: (key: string) => PluginType | undefined;
  setPluginType: (key: string, type: PluginType) => void;
  
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
      try {
        console.log('Initializing plugin system...');
        
        // Discover and load plugins
        await discoverAndLoadComponents();
        
        // Initialize plugin state
        const keys = getComponentKeys();
        const initialState = Object.fromEntries(
          keys.map(key => [key, true])
        );
        
        setPluginState(initialState);
        setIsLoaded(true);
        console.log('Plugin system initialized with', keys.length, 'plugins');
      } catch (error) {
        console.error('Failed to initialize plugin system:', error);
        
        // Even on error, mark as loaded to prevent UI from hanging
        setIsLoaded(true);
      }
    };
    
    initPlugins();
  }, [getComponentKeys]);
  
  // Memoize plugin registration functions to prevent re-renders
  const registerPlugin = useCallback((key: string, component: React.ComponentType<PluginComponentProps>, type: PluginType = 'flow') => {
    store.registerComponent(key, component, type);
    
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
      enabled: isPluginEnabled(key),
      type: store.getPluginType(key)
    }));
  }, [getComponentKeys, isPluginEnabled, store]);
  
  // Get plugins by type
  const getPluginKeysByType = useCallback((type: PluginType): string[] => {
    return store.getComponentKeysByType(type);
  }, [store]);
  
  // Get plugins by type
  const getPluginsByType = useCallback((type: PluginType): Plugin[] => {
    return store.getComponentKeysByType(type).map(key => ({
      key,
      enabled: isPluginEnabled(key),
      type
    }));
  }, [store, isPluginEnabled]);
  
  // Get plugin type
  const getPluginType = useCallback((key: string): PluginType | undefined => {
    return store.getPluginType(key);
  }, [store]);
  
  // Set plugin type
  const setPluginType = useCallback((key: string, type: PluginType): void => {
    store.setPluginType(key, type);
  }, [store]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<PluginContextType>(() => ({
    registerPlugin,
    unregisterPlugin,
    getPluginComponent,
    getPluginKeys: getComponentKeys,
    getPluginKeysByType,
    getAllPlugins,
    getPluginsByType,
    setPluginData,
    getPluginData,
    isPluginEnabled,
    togglePlugin,
    getPluginType,
    setPluginType,
    isLoaded
  }), [
    registerPlugin,
    unregisterPlugin,
    getPluginComponent,
    getComponentKeys,
    getPluginKeysByType,
    getAllPlugins,
    getPluginsByType,
    setPluginData,
    getPluginData,
    isPluginEnabled,
    togglePlugin,
    getPluginType,
    setPluginType,
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

// Implementacja PluginRegistry używająca store bezpośrednio
// Uwaga: To rozwiązanie powinno być używane tylko poza komponentami React
// W komponentach React zawsze używaj hooków (usePlugins)
export const PluginRegistry = {
  register: (key: string, component: React.ComponentType<PluginComponentProps>, type: PluginType = 'flow') => {
    // Używamy create() aby uzyskać kopię store z dostępem do metod
    const store = useDynamicComponentStore.getState();
    store.registerComponent(key, component, type);
  },
  unregister: (key: string) => {
    const store = useDynamicComponentStore.getState();
    store.unregisterComponent(key);
  },
  getComponent: (key: string) => {
    const store = useDynamicComponentStore.getState();
    return store.getComponent(key);
  },
  setData: (key: string, data: unknown) => {
    const store = useDynamicComponentStore.getState();
    store.setComponentData(key, data);
  },
  getData: (key: string) => {
    const store = useDynamicComponentStore.getState();
    return store.getComponentData(key);
  },
  getPluginType: (key: string) => {
    const store = useDynamicComponentStore.getState();
    return store.getPluginType(key);
  },
  setPluginType: (key: string, type: PluginType) => {
    const store = useDynamicComponentStore.getState();
    store.setPluginType(key, type);
  },
  getComponentsByType: (type: PluginType) => {
    const store = useDynamicComponentStore.getState();
    return store.getComponentKeysByType(type).map(key => ({
      key,
      component: store.getComponent(key)
    }));
  }
};