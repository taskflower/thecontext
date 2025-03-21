import React, { useState, useEffect } from 'react';
import { Power, PowerOff, PlugZap, Check, ChevronRight } from 'lucide-react';
import useDynamicComponentStore from './pluginsStore';
import { cn } from '@/utils/utils';

interface Plugin {
  key: string;
  enabled: boolean;
}

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null);
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

  const toggleExpandPlugin = (key: string) => {
    setExpandedPlugin(expandedPlugin === key ? null : key);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h2 className="text-lg font-medium flex items-center">
            <PlugZap className="h-5 w-5 mr-2 text-primary" />
            Plugin Manager
          </h2>
        </div>
        
        {plugins.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No plugins available</p>
            <p className="text-sm mt-2">Check the documentation to learn how to create plugins</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {plugins.map(plugin => (
              <div key={plugin.key} className="text-sm">
                <div className={cn(
                  "flex items-center justify-between px-4 py-3",
                  plugin.enabled ? "bg-background" : "bg-muted/30"
                )}>
                  <div 
                    className="flex items-center cursor-pointer flex-1"
                    onClick={() => toggleExpandPlugin(plugin.key)}
                  >
                    <ChevronRight className={cn(
                      "h-4 w-4 mr-2 text-muted-foreground transition-transform duration-200",
                      expandedPlugin === plugin.key ? "transform rotate-90" : ""
                    )} />
                    
                    <div className="font-medium">{plugin.key}</div>
                    
                    <div className={cn(
                      "ml-3 px-1.5 py-0.5 text-xs rounded-full",
                      plugin.enabled 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {plugin.enabled ? (
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Enabled
                        </span>
                      ) : (
                        "Disabled"
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => togglePlugin(plugin.key)}
                    className={cn(
                      "p-1.5 rounded-md flex items-center gap-1.5",
                      plugin.enabled 
                        ? "text-destructive hover:bg-destructive/10" 
                        : "text-primary hover:bg-primary/10"
                    )}
                  >
                    {plugin.enabled ? (
                      <>
                        <PowerOff className="h-4 w-4" />
                        <span className="font-medium">Disable</span>
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4" />
                        <span className="font-medium">Enable</span>
                      </>
                    )}
                  </button>
                </div>
                
                {expandedPlugin === plugin.key && (
                  <div className="bg-muted/5 px-4 py-3 border-t border-border/50">
                    <h3 className="font-medium mb-2">Plugin Details</h3>
                    <div className="text-muted-foreground">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>ID:</div>
                        <div>{plugin.key}</div>
                        <div>Type:</div>
                        <div>Component Plugin</div>
                        <div>Status:</div>
                        <div className={plugin.enabled ? "text-primary" : "text-destructive"}>
                          {plugin.enabled ? "Active" : "Inactive"}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs">This plugin can be configured through the Plugin API. See documentation for more details.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;