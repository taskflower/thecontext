

import { pluginRegistry } from './PluginRegistry';
import { urlInputPlugin } from './URLInputNodePlugin';
import { contextInfoPlugin } from './ContextInfoPlugin';

// Rejestracja wszystkich pluginów
pluginRegistry.registerAll([
  urlInputPlugin,
  contextInfoPlugin
]);

export { pluginRegistry };
export type { NodePlugin, ValidationResult } from './types';
export { ContextInfoPlugin, contextInfoPlugin } from './ContextInfoPlugin';