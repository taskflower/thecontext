// src/modules/plugins/PluginsApp.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePlugins } from "./pluginContext";
import { 
  NoPluginsAvailableUI, 
  PluginDisabledUI, 
  SelectPluginMessageUI, 
  AllPluginsDisabledMessageUI 
} from "./components";
import PluginCard from "./components/PluginCard";
import EditorPluginWrapper from "./wrappers/EditorPluginWrapper";

const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Use our plugin context instead of direct Zustand store access
  const { 
    getPluginKeys, 
    isPluginEnabled, 
    togglePlugin,
    isLoaded
  } = usePlugins();
  
  // Get component keys once and memoize
  const componentKeys = useMemo(() => getPluginKeys(), [getPluginKeys]);
  
  // Set first component as selected by default when available
  useEffect(() => {
    if (componentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(componentKeys[0]);
    }
  }, [componentKeys, selectedComponent]);

  // Memoize enabled component keys
  const enabledComponentKeys = useMemo(() => 
    componentKeys.filter(isPluginEnabled), 
    [componentKeys, isPluginEnabled]
  );

  // Memoize callback functions
  const handleTogglePlugin = useCallback((key: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlugin(key);
  }, [togglePlugin]);

  const handleSelectPlugin = useCallback((key: string) => () => {
    if (isPluginEnabled(key)) {
      setSelectedComponent(key);
    }
  }, [isPluginEnabled]);

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
                onSelect={handleSelectPlugin(key)}
                onToggle={handleTogglePlugin(key)}
              />
            ))}
          </div>

          {/* Right column: Plugin preview */}
          <div className="w-2/3">
            <h3 className="text-lg font-medium mb-2 px-2">Plugin Preview</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              {selectedComponent && isPluginEnabled(selectedComponent) ? (
                <EditorPluginWrapper componentKey={selectedComponent} />
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