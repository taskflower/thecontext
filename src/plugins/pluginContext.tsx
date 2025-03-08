// src/plugins/pluginContext.tsx
import React, { createContext, useContext } from 'react';
import { PluginManager } from './types';
import { pluginManager } from './pluginManager';

// React context for plugin manager access
export const PluginManagerContext = createContext<PluginManager>(pluginManager);

/**
 * Hook for accessing the plugin manager in React components
 */
export function usePluginManager(): PluginManager {
  return useContext(PluginManagerContext);
}

/**
 * Provider component for the plugin manager
 */
export function PluginManagerProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <PluginManagerContext.Provider value={pluginManager}>
      {children}
    </PluginManagerContext.Provider>
  );
}