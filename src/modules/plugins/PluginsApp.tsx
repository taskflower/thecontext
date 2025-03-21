/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Puzzle, GitBranch, Layers, Code, AlertCircle, ChevronDown } from 'lucide-react';
import useDynamicComponentStore from './pluginsStore';
import DynamicComponentWrapper from './PluginWrapper';
import PluginManager from './PluginManager';
import { discoverAndLoadComponents } from './pluginsDiscovery';
import { cn } from '@/utils/utils';

// Define a type for the window with our custom properties
declare global {
  interface Window {
    __DYNAMIC_COMPONENTS__: {
      registry: any;
      register: (key: string, component: React.ComponentType<any>) => void;
      unregister: (key: string) => void;
    };
  }
}

// This is our main app that will render dynamic components
const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const getComponentKeys = useDynamicComponentStore(state => state.getComponentKeys);
  const componentKeys = getComponentKeys();
  const [pluginState, setPluginState] = useState<Record<string, boolean>>({});
  
  // Set first component as selected by default when available
  useEffect(() => {
    if (componentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(componentKeys[0]);
    }
  }, [componentKeys, selectedComponent]);

  // Create a global window property to allow dynamic component registration
  useEffect(() => {
    // Extend the window interface
    const win = window as any;
    
    // Create a global registry if it doesn't exist
    if (!win.__DYNAMIC_COMPONENTS__) {
      win.__DYNAMIC_COMPONENTS__ = {
        registry: useDynamicComponentStore.getState(),
        register: (key: string, component: React.ComponentType<any>) => {
          useDynamicComponentStore.getState().registerComponent(key, component);
        },
        unregister: (key: string) => {
          useDynamicComponentStore.getState().unregisterComponent(key);
        }
      };
    }
    
    // Add component auto-discovery
    discoverAndLoadComponents();
    
    return () => {
      // Cleanup (optional)
      // delete win.__DYNAMIC_COMPONENTS__;
    };
  }, []);

  // Listen for plugin state changes
  useEffect(() => {
    const handlePluginStateChange = (event: CustomEvent<Record<string, boolean>>) => {
      setPluginState(event.detail);
    };
    
    window.addEventListener('plugin-state-change' as any, handlePluginStateChange);
    
    return () => {
      window.removeEventListener('plugin-state-change' as any, handlePluginStateChange);
    };
  }, []);

  // Check if selected component is enabled
  const isComponentEnabled = (key: string) => {
    return pluginState[key] !== false; // Default to true if not specified
  };

  // Get enabled component keys
  const enabledComponentKeys = componentKeys.filter(isComponentEnabled);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Plugin Manager section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-muted/20"
          onClick={() => setShowPluginManager(!showPluginManager)}
        >
          <div className="flex items-center">
            <Puzzle className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-medium">Plugin Manager</h2>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 transition-transform duration-200",
            showPluginManager ? "transform rotate-180" : ""
          )} />
        </div>
        
        {showPluginManager && (
          <div className="mt-2">
            <PluginManager />
          </div>
        )}
      </div>
      
      {componentKeys.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Plugins Available</h3>
          <p className="text-muted-foreground mb-4">
            No components have been registered yet. Use the global registry to register components.
          </p>
          <div className="bg-muted p-4 rounded-md overflow-auto text-left text-sm">
            <pre className="whitespace-pre-wrap">
              {`// Register a component dynamically
const MyComponent = () => <div>My Component Content</div>;

// Method 1: Using the window object
window.__DYNAMIC_COMPONENTS__.register('MyComponent', MyComponent);

// Method 2: Using the exported function
import { registerDynamicComponent } from './store/dynamicComponentStore';
registerDynamicComponent('MyComponent', MyComponent);`}
            </pre>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Component selector tabs */}
            <div className="flex border-b border-border bg-muted/10 p-1">
              {componentKeys.map(key => (
                <button 
                  key={key}
                  onClick={() => setSelectedComponent(key)}
                  disabled={!isComponentEnabled(key)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md mr-1",
                    selectedComponent === key 
                      ? "bg-background text-primary"
                      : "text-muted-foreground hover:bg-muted/50",
                    !isComponentEnabled(key) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ComponentIcon name={key} className="h-4 w-4 mr-2" />
                  {key}
                  {!isComponentEnabled(key) && (
                    <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                      Disabled
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Component display */}
            <div className="p-4">
              {selectedComponent && isComponentEnabled(selectedComponent) ? (
                <DynamicComponentWrapper componentKey={selectedComponent} />
              ) : selectedComponent ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm">
                    The selected component is currently disabled. 
                    Enable it from the Plugin Manager to use it.
                  </p>
                </div>
              ) : enabledComponentKeys.length > 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  <p>Select a component from the tabs above.</p>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <p>All components are currently disabled.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper component to display an icon based on component name
const ComponentIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const iconProps = { className: className || "h-5 w-5" };
  
  if (name.toLowerCase().includes('scenario')) {
    return <GitBranch {...iconProps} />;
  } else if (name.toLowerCase().includes('node')) {
    return <Layers {...iconProps} />;
  } else if (name.toLowerCase().includes('edge') || name.toLowerCase().includes('connection')) {
    return <Code {...iconProps} />;
  } 
  
  return <Puzzle {...iconProps} />;
};

export default PluginsApp;