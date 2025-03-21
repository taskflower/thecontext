// src/modules/plugins/PluginManager.tsx
import React, { useState, useEffect } from 'react';
import useDynamicComponentStore from './pluginsStore';

interface Plugin {
  key: string;
  enabled: boolean;
}

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const getComponentKeys = useDynamicComponentStore(state => state.getComponentKeys);
  
  useEffect(() => {
    // Initialize plugins from registered components
    const keys = getComponentKeys();
    const initialPlugins = keys.map(key => ({ key, enabled: true }));
    setPlugins(initialPlugins);
    
    // Dispatch initial plugin state
    dispatchPluginState(initialPlugins);
    
    // Subscribe to component registry changes
    const unsubscribe = useDynamicComponentStore.subscribe((state) => {
      const currentKeys = state.getComponentKeys();
      setPlugins(prevPlugins => {
        // Keep existing plugin status if already in the list
        const existingKeys = new Set(prevPlugins.map(p => p.key));
        // Add new plugins
        const updatedPlugins = [...prevPlugins];
        currentKeys.forEach(key => {
          if (!existingKeys.has(key)) {
            updatedPlugins.push({ key, enabled: true });
          }
        });
        // Remove plugins that no longer exist
        const filteredPlugins = updatedPlugins.filter(p => currentKeys.includes(p.key));
        
        // Dispatch updated plugin state
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
  
  return (
    <div className="border border-gray-300 rounded-md p-4 mt-5">
      <h2 className="mt-0 mb-4 text-xl font-semibold">Plugin Manager</h2>
      
      {plugins.length === 0 ? (
        <p>No plugins available</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {plugins.map(plugin => (
            <li key={plugin.key} className={`flex justify-between items-center p-2 rounded-md border border-gray-200 ${plugin.enabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <span className="font-medium">{plugin.key}</span>
              <div>
                <span className={`mr-3 font-medium ${plugin.enabled ? 'text-green-500' : 'text-gray-400'}`}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button 
                  onClick={() => togglePlugin(plugin.key)}
                  className={`px-3 py-1 text-white border-none rounded-md cursor-pointer ${plugin.enabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {plugin.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PluginManager;