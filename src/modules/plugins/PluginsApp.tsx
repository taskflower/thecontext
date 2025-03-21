/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Puzzle,
  GitBranch,
  Layers,
  Code,
  AlertCircle,
  Power,
  PowerOff
} from "lucide-react";
import useDynamicComponentStore from "./pluginsStore";
import DynamicComponentWrapper from "./PluginWrapper";
import PluginManager from "./PluginManager";
import { discoverAndLoadComponents } from "./pluginsDiscovery";
import { cn } from "@/utils/utils";

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
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [showPluginManager, setShowPluginManager] = useState(false);
  const getComponentKeys = useDynamicComponentStore(
    (state) => state.getComponentKeys
  );
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
        },
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
    const handlePluginStateChange = (
      event: CustomEvent<Record<string, boolean>>
    ) => {
      setPluginState(event.detail);
    };

    window.addEventListener(
      "plugin-state-change" as any,
      handlePluginStateChange
    );

    return () => {
      window.removeEventListener(
        "plugin-state-change" as any,
        handlePluginStateChange
      );
    };
  }, []);

  // Check if selected component is enabled
  const isComponentEnabled = (key: string) => {
    return pluginState[key] !== false; // Default to true if not specified
  };

  // Toggle plugin enable/disable
  const togglePlugin = (key: string) => {
    const newState = { ...pluginState, [key]: !isComponentEnabled(key) };
    setPluginState(newState);
    
    const event = new CustomEvent('plugin-state-change', { 
      detail: newState 
    });
    
    window.dispatchEvent(event);
  };

  // Get enabled component keys
  const enabledComponentKeys = componentKeys.filter(isComponentEnabled);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Plugin Manager toggle */}
      <div className="mb-6">
        <button
          className="flex items-center px-4 py-2 text-sm bg-primary/10 text-primary rounded-md"
          onClick={() => setShowPluginManager(!showPluginManager)}
        >
          <Puzzle className="h-4 w-4 mr-2" />
          {showPluginManager ? "Hide" : "Show"} Plugin Manager
        </button>
      </div>

      {showPluginManager && (
        <div className="mb-6">
          <PluginManager />
        </div>
      )}

      {/* Two column layout for plugins */}
      {componentKeys.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Plugins Available</h3>
          <p className="text-muted-foreground mb-4">
            No components have been registered yet. Use the global registry to
            register components.
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
        <div className="flex gap-6">
          {/* Left column: Plugin cards */}
          <div className="w-1/3 space-y-3">
            <h2 className="text-lg font-medium mb-2 px-2">Available Plugins</h2>
            {componentKeys.map((key) => (
              <div
                key={key}
                className={cn(
                  "border border-border rounded-lg overflow-hidden cursor-pointer transition-colors",
                  selectedComponent === key 
                    ? "border-primary/60 bg-primary/5" 
                    : "hover:bg-muted/10",
                  !isComponentEnabled(key) && "opacity-70"
                )}
                onClick={() => isComponentEnabled(key) && setSelectedComponent(key)}
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <ComponentIcon name={key} className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">{key}</h3>
                      <p className="text-xs text-muted-foreground">Component Plugin</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlugin(key);
                    }}
                    className={cn(
                      "p-1.5 rounded-md",
                      isComponentEnabled(key)
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-primary hover:bg-primary/10"
                    )}
                  >
                    {isComponentEnabled(key) ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className={cn(
                  "px-3 py-2 text-xs border-t border-border flex justify-between items-center",
                  isComponentEnabled(key) 
                    ? "bg-muted/20" 
                    : "bg-muted/40"
                )}>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    isComponentEnabled(key)
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isComponentEnabled(key) ? "Enabled" : "Disabled"}
                  </span>
                  {selectedComponent === key && (
                    <span className="text-primary">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right column: Plugin preview */}
          <div className="w-2/3">
            <h2 className="text-lg font-medium mb-2 px-2">Plugin Preview</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              {selectedComponent && isComponentEnabled(selectedComponent) ? (
                <DynamicComponentWrapper componentKey={selectedComponent} />
              ) : selectedComponent ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm">
                    The selected component is currently disabled. Enable it to use it.
                  </p>
                </div>
              ) : enabledComponentKeys.length > 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  <p>Select a plugin from the left column to preview it here.</p>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <p>All plugins are currently disabled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to display an icon based on component name
const ComponentIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => {
  const iconProps = { className: className || "h-5 w-5" };

  if (name.toLowerCase().includes("scenario")) {
    return <GitBranch {...iconProps} />;
  } else if (name.toLowerCase().includes("node")) {
    return <Layers {...iconProps} />;
  } else if (
    name.toLowerCase().includes("edge") ||
    name.toLowerCase().includes("connection")
  ) {
    return <Code {...iconProps} />;
  }

  return <Puzzle {...iconProps} />;
};

export default PluginsApp;