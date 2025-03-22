// src/modules/plugins/PluginManager.tsx
import React, { useState } from 'react';
import { usePlugins } from './pluginContext';
import { PluginManagerUI } from './components';

const PluginManager: React.FC = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  
  // Use our plugin context instead of direct Zustand store access
  const { getAllPlugins, togglePlugin } = usePlugins();
  
  const plugins = getAllPlugins();
  
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