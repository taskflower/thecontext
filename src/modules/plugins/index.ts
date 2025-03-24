// src/modules/plugins/index.ts
export { PluginProvider, usePlugins, PluginRegistry } from './pluginContext';
export { loadPlugin } from './pluginsDiscovery';
export type { 
  Plugin, 
  PluginComponentProps, 
  AppContextData,
  PluginSettings,
  PluginPreviewWrapperProps
} from './types';

export { default as PluginManager } from './PluginManager';
export { default as PluginsApp } from './PluginsApp';