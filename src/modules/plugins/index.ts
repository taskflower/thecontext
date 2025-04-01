// src/modules/plugins/index.ts
export { PluginProvider, usePlugins, PluginRegistry } from './pluginContext';
export { discoverAndLoadComponents as loadPlugins, initializePluginModules } from './pluginsDiscovery';
export type { 
  Plugin, 
  PluginComponentProps, 
  AppContextData,
  PluginSettings,
  PluginPreviewWrapperProps,
  PluginType
} from './types';

export { default as PluginManager } from './PluginManager';
export { default as PluginsApp } from './PluginsApp';