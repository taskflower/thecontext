// src/modules/plugin/index.ts
// Central export point for the plugin system

// Types and interfaces
export * from './types';
export * from './componentRegistry';

// Store and hooks
export { usePluginStore } from './store';
export { useMessageProcessor } from './processor';

// Plugin management
export { loadPlugins, ensurePluginsLoaded, arePluginsLoaded } from './loader';

// Components
export { PluginsPanel } from './components/PluginsPanel';
export { PluginSelector } from './components/PluginSelector';
export { PluginOptions } from './components/PluginOptions';