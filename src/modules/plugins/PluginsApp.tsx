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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PluginType } from "./types";
import { Badge } from "@/components/ui/badge";
import { PanelRight, LayoutDashboard, Grid3X3, Box, Puzzle } from "lucide-react";

const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'dashboard' | 'all'>('all');
  
  // Use our plugin context instead of direct Zustand store access
  const { 
    getPluginKeys, 
    getPluginKeysByType,
    isPluginEnabled, 
    togglePlugin,
    isLoaded,
    getPluginType
  } = usePlugins();
  
  // Get component keys once and memoize
  const allComponentKeys = useMemo(() => getPluginKeys(), [getPluginKeys]);
  const flowComponentKeys = useMemo(() => getPluginKeysByType('flow'), [getPluginKeysByType]);
  const dashboardComponentKeys = useMemo(() => getPluginKeysByType('dashboard'), [getPluginKeysByType]);
  
  // Get visible components based on active tab
  const visibleComponentKeys = useMemo(() => {
    switch (activeTab) {
      case 'flow':
        return flowComponentKeys;
      case 'dashboard':
        return dashboardComponentKeys;
      case 'all':
      default:
        return allComponentKeys;
    }
  }, [activeTab, allComponentKeys, flowComponentKeys, dashboardComponentKeys]);
  
  // Set first component as selected by default when available
  useEffect(() => {
    if (visibleComponentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(visibleComponentKeys[0]);
    } else if (visibleComponentKeys.length > 0 && !visibleComponentKeys.includes(selectedComponent || '')) {
      setSelectedComponent(visibleComponentKeys[0]);
    }
  }, [visibleComponentKeys, selectedComponent]);

  // Memoize enabled component keys
  const enabledComponentKeys = useMemo(() => 
    visibleComponentKeys.filter(isPluginEnabled), 
    [visibleComponentKeys, isPluginEnabled]
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

  // Get type icon based on plugin type
  const getTypeIcon = useCallback((key: string) => {
    const type = getPluginType(key);
    switch (type) {
      case 'dashboard':
        return <LayoutDashboard className="h-4 w-4 mr-1" />;
      case 'flow':
        return <PanelRight className="h-4 w-4 mr-1" />;
      default:
        return <Puzzle className="h-4 w-4 mr-1" />;
    }
  }, [getPluginType]);

  // Show loading state if plugins aren't loaded yet
  if (!isLoaded) {
    return (
      <div className="w-full p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <Puzzle className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary/50" />
          <p>Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tabs for filtering plugins */}
      <div className="border-b pb-4 pt-2 px-4">
        <div className="flex items-center justify-between">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'flow' | 'dashboard' | 'all')}
            className="w-[400px]"
          >
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Box className="h-4 w-4" />
                <span>All Plugins</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {allComponentKeys.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flow" className="flex items-center gap-1">
                <PanelRight className="h-4 w-4" />
                <span>Flow Plugins</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {flowComponentKeys.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                <span>Widgets</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {dashboardComponentKeys.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {visibleComponentKeys.length === 0 ? (
          <NoPluginsAvailableUI />
        ) : (
          <div className="flex h-full">
            {/* Left column: Plugin cards grid */}
            <div className="w-2/5 p-4 space-y-4 overflow-auto border-r">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleComponentKeys.map((key) => (
                  <PluginCard
                    key={key}
                    pluginKey={key}
                    pluginType={getPluginType(key)}
                    typeIcon={getTypeIcon(key)}
                    isEnabled={isPluginEnabled(key)}
                    isSelected={selectedComponent === key}
                    onSelect={handleSelectPlugin(key)}
                    onToggle={handleTogglePlugin(key)}
                  />
                ))}
              </div>
            </div>

            {/* Right column: Plugin preview */}
            <div className="w-3/5 p-4 overflow-auto">
              <div className="h-full flex flex-col">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  {selectedComponent && (
                    <>
                      {getTypeIcon(selectedComponent || '')}
                      <span className="mr-2">{selectedComponent}</span>
                      <Badge variant="outline" className="ml-1">
                        {getPluginType(selectedComponent || '') || 'plugin'}
                      </Badge>
                    </>
                  )}
                </h3>
                <div className="flex-1 border border-border rounded-lg overflow-hidden">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginsApp;