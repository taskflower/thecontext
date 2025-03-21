/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Puzzle, Settings } from "lucide-react";
import useDynamicComponentStore from "./pluginsStore";
import DynamicComponentWrapper from "./PluginWrapper";
import PluginManager from "./PluginManager";
import { discoverAndLoadComponents } from "./pluginsDiscovery";
import { 
  TabButton, 
  PluginCard, 
  NoPluginsAvailableUI, 
  PluginDisabledUI, 
  SelectPluginMessageUI, 
  AllPluginsDisabledMessageUI 
} from "./components";

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

// Tab type for our tabbed interface
type TabType = 'plugins' | 'manager';

const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('plugins');
  const getComponentKeys = useDynamicComponentStore(state => state.getComponentKeys);
  const componentKeys = getComponentKeys();
  const [pluginState, setPluginState] = useState<Record<string, boolean>>({});

  // Set first component as selected by default when available
  useEffect(() => {
    if (componentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(componentKeys[0]);
    }
  }, [componentKeys, selectedComponent]);

  // Initialize global registry for dynamic component registration
  useEffect(() => {
    const win = window as any;

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

    // Auto-discover components
    discoverAndLoadComponents();
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

  // Check if a component is enabled
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
    <div className="w-full">
      {/* Tab navigation */}
      <nav className="p-1 flex border-b border-border mb-4">
        <TabButton 
          icon={<Puzzle className="h-4 w-4" />}
          label="Plugins"
          active={activeTab === 'plugins'}
          onClick={() => setActiveTab('plugins')}
        />
        <TabButton 
          icon={<Settings className="h-4 w-4" />}
          label="Manager"
          active={activeTab === 'manager'}
          onClick={() => setActiveTab('manager')}
        />
      </nav>

      {/* Tab content */}
      {activeTab === 'manager' && <PluginManager />}

      {activeTab === 'plugins' && (
        componentKeys.length === 0 ? (
          <NoPluginsAvailableUI />
        ) : (
          <div className="flex gap-6">
            {/* Left column: Plugin cards */}
            <div className="w-1/3 space-y-3">
              <h2 className="text-lg font-medium mb-2 px-2">Available Plugins</h2>
              {componentKeys.map((key) => (
                <PluginCard
                  key={key}
                  pluginKey={key}
                  isEnabled={isComponentEnabled(key)}
                  isSelected={selectedComponent === key}
                  onSelect={() => isComponentEnabled(key) && setSelectedComponent(key)}
                  onToggle={(e) => {
                    e.stopPropagation();
                    togglePlugin(key);
                  }}
                />
              ))}
            </div>

            {/* Right column: Plugin preview */}
            <div className="w-2/3">
              <h2 className="text-lg font-medium mb-2 px-2">Plugin Preview</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                {selectedComponent && isComponentEnabled(selectedComponent) ? (
                  <DynamicComponentWrapper componentKey={selectedComponent} />
                ) : selectedComponent ? (
                  <PluginDisabledUI />
                ) : enabledComponentKeys.length > 0 ? (
                  <SelectPluginMessageUI />
                ) : (
                  <AllPluginsDisabledMessageUI />
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PluginsApp;