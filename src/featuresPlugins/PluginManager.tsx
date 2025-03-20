// src/featuresPlugins/PluginManager.tsx
import React, { useState, useEffect } from 'react';
import useDynamicComponentStore from './dynamicComponentStore';

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
    const pluginState = Object.fromEntries(
      initialPlugins.map(plugin => [plugin.key, plugin.enabled])
    );
    
    const event = new CustomEvent('plugin-state-change', { 
      detail: pluginState 
    });
    
    window.dispatchEvent(event);
    
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
        const updatedPluginState = Object.fromEntries(
          filteredPlugins.map(plugin => [plugin.key, plugin.enabled])
        );
        
        const updateEvent = new CustomEvent('plugin-state-change', { 
          detail: updatedPluginState 
        });
        
        window.dispatchEvent(updateEvent);
        
        return filteredPlugins;
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [getComponentKeys]);
  
  const togglePlugin = (key: string) => {
    setPlugins(prevPlugins => {
      const newPlugins = prevPlugins.map(plugin => 
        plugin.key === key ? { ...plugin, enabled: !plugin.enabled } : plugin
      );
      
      // Dispatch custom event with plugin state
      const pluginState = Object.fromEntries(
        newPlugins.map(plugin => [plugin.key, plugin.enabled])
      );
      
      const event = new CustomEvent('plugin-state-change', { 
        detail: pluginState 
      });
      
      window.dispatchEvent(event);
      
      return newPlugins;
    });
  };
  
  return (
    <div className="plugin-manager" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      padding: '15px',
      marginTop: '20px'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Plugin Manager</h2>
      
      {plugins.length === 0 ? (
        <p>No plugins available</p>
      ) : (
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {plugins.map(plugin => (
            <li key={plugin.key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: plugin.enabled ? '#f0f9ff' : '#f5f5f5',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>{plugin.key}</span>
              <div>
                <span style={{ 
                  marginRight: '10px', 
                  color: plugin.enabled ? '#52c41a' : '#bfbfbf',
                  fontWeight: 500
                }}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button 
                  onClick={() => togglePlugin(plugin.key)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: plugin.enabled ? '#ff4d4f' : '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
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