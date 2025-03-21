import React, { useState, useEffect } from 'react';
import useDynamicComponentStore from './pluginsStore';
import { Plugin } from './types';
import { PluginManagerUI } from './components';

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const getComponentKeys = useDynamicComponentStore(state => state.getComponentKeys);

  useEffect(() => {
    // Initialize plugins from registered components
    const keys = getComponentKeys();
    const initialPlugins = keys.map((key: string) => ({ key, enabled: true }));
    setPlugins(initialPlugins);
    
    // Send initial plugin state
    dispatchPluginState(initialPlugins);
    
    // Subscribe to changes in component registry
    const unsubscribe = useDynamicComponentStore.subscribe((state) => {
      const currentKeys = state.getComponentKeys();
      setPlugins(prevPlugins => {
        const existingKeys = new Set(prevPlugins.map(p => p.key));
        const updatedPlugins = [...prevPlugins];
        currentKeys.forEach((key: string) => {
          if (!existingKeys.has(key)) {
            updatedPlugins.push({ key, enabled: true });
          }
        });
        const filteredPlugins = updatedPlugins.filter(p => currentKeys.includes(p.key));
        dispatchPluginState(filteredPlugins);
        return filteredPlugins;
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [getComponentKeys]);
  
  const dispatchPluginState = (plugins: Plugin[]) => {
    const pluginState = Object.fromEntries(
      plugins.map(plugin => [plugin.key, plugin.enabled])
    );
    
    const event = new CustomEvent('plugin-state-change', { 
      detail: pluginState 
    });
    
    window.dispatchEvent(event);
  };
  
  const togglePlugin = (key: string) => {
    setPlugins(prevPlugins => {
      const newPlugins = prevPlugins.map(plugin => 
        plugin.key === key ? { ...plugin, enabled: !plugin.enabled } : plugin
      );
      
      dispatchPluginState(newPlugins);
      
      return newPlugins;
    });
  };

  const handleSelectPlugin = (key: string) => {
    setSelectedPlugin(key === selectedPlugin ? null : key);
  };
  
  return (
    <PluginManagerUI
      plugins={plugins}
      selectedPlugin={selectedPlugin}
      onSelectPlugin={handleSelectPlugin}
      onTogglePlugin={togglePlugin}
    />
  );
};

export default PluginManager;