// src/modules/plugin/index.ts
// Centralny punkt eksportu dla systemu pluginów

// Typy
export * from './types';

// Store i hook 
export { usePluginStore } from './store';

// Loader
export { loadPlugins } from './loader';

// Procesor
export { useMessageProcessor } from './processor';

// Komponenty
export { MessageProcessor } from './components/MessageProcessor';
export { PluginsPanel } from './components/PluginsPanel';
export { PluginSelector } from './components/PluginSelector';
export { PluginOptions } from './components/PluginOptions';