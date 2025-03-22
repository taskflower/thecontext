// src/modules/plugins/PluginsApp.tsx
import React, { useEffect, useState } from "react";
import DynamicComponentWrapper from "./PluginWrapper";
import { usePlugins } from "./pluginContext";
import { 
  PluginCard, 
  NoPluginsAvailableUI, 
  PluginDisabledUI, 
  SelectPluginMessageUI, 
  AllPluginsDisabledMessageUI 
} from "./components";

const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Use our plugin context instead of direct Zustand store access
  const { 
    getPluginKeys, 
    isPluginEnabled, 
    togglePlugin,
    isLoaded
  } = usePlugins();
  
  const componentKeys = getPluginKeys();
  
  // Set first component as selected by default when available
  useEffect(() => {
    if (componentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(componentKeys[0]);
    }
  }, [componentKeys, selectedComponent]);

  // Get enabled component keys
  const enabledComponentKeys = componentKeys.filter(isPluginEnabled);

  // Show loading state if plugins aren't loaded yet
  if (!isLoaded) {
    return (
      <div className="w-full p-4 text-center">
        <p>Loading plugins...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
     

      {componentKeys.length === 0 ? (
        <NoPluginsAvailableUI />
      ) : (
        <div className="flex gap-6">
          {/* Left column: Plugin cards */}
          <div className="w-1/3 space-y-3">
            <h3 className="text-lg font-medium mb-2 px-2">Available Plugins</h3>
            {componentKeys.map((key) => (
              <PluginCard
                key={key}
                pluginKey={key}
                isEnabled={isPluginEnabled(key)}
                isSelected={selectedComponent === key}
                onSelect={() => isPluginEnabled(key) && setSelectedComponent(key)}
                onToggle={(e) => {
                  e.stopPropagation();
                  togglePlugin(key);
                }}
              />
            ))}
          </div>

          {/* Right column: Plugin preview */}
          <div className="w-2/3">
            <h3 className="text-lg font-medium mb-2 px-2">Plugin Preview</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              {selectedComponent && isPluginEnabled(selectedComponent) ? (
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
      )}
    </div>
  );
};

export default PluginsApp;