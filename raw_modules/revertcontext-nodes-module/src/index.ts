// src/index.ts
// Główny punkt wejściowy eksportujący API modułu

// Import properly from local modules instead of the package itself
import { NodeData } from './types/NodeTypes';
import { NodeManager } from './core/NodeManager';
import { DefaultContextService } from './services/DefaultContextService';
import { DefaultPluginService } from './services/PluginService';

export * from './models/Node';
export * from './models/NodeCollection';
export * from './core/NodeProcessor';
export * from './core/NodeManager';
export * from './services/ContextService';
export * from './services/DefaultContextService';
export * from './services/PluginService';
export * from './utils/nodeValidators';
export * from './utils/nodeTransformers';
export * from './types/NodeTypes';

// Fabryka dla łatwiejszego tworzenia NodeManager z domyślnymi usługami
export function createNodeManager(
  contextManager: any,
  initialNodes: NodeData[] = []
): NodeManager {
  const contextService = new DefaultContextService(contextManager);
  const pluginService = new DefaultPluginService();
  return new NodeManager(contextService, initialNodes, pluginService);
}