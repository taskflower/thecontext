// src/services/PluginService.ts
// Zarządzanie pluginami dla węzłów

import { PluginExecutionResult } from '../types/NodeTypes';

/**
 * Interfejs serwisu obsługującego pluginy
 */
export interface PluginService {
  /**
   * Wykonuje plugin z danymi parametrami
   */
  executePlugin(
    pluginKey: string, 
    nodeId: string, 
    params: Record<string, any>
  ): Promise<PluginExecutionResult>;
  
  /**
   * Sprawdza czy plugin o podanym kluczu istnieje
   */
  hasPlugin(pluginKey: string): boolean;
  
  /**
   * Rejestruje nowy plugin
   */
  registerPlugin(
    pluginKey: string, 
    executor: (nodeId: string, params: Record<string, any>) => Promise<any>
  ): void;
}

/**
 * Domyślna implementacja serwisu pluginów
 */
export class DefaultPluginService implements PluginService {
  private plugins: Map<string, (nodeId: string, params: Record<string, any>) => Promise<any>> = new Map();

  executePlugin(
    pluginKey: string, 
    nodeId: string, 
    params: Record<string, any>
  ): Promise<PluginExecutionResult> {
    const plugin = this.plugins.get(pluginKey);
    
    if (!plugin) {
      return Promise.resolve({
        success: false,
        data: null,
        error: `Plugin '${pluginKey}' nie istnieje`
      });
    }
    
    return plugin(nodeId, params)
      .then(data => ({
        success: true,
        data
      }))
      .catch(error => ({
        success: false,
        data: null,
        error: error.message || String(error)
      }));
  }

  hasPlugin(pluginKey: string): boolean {
    return this.plugins.has(pluginKey);
  }

  registerPlugin(
    pluginKey: string, 
    executor: (nodeId: string, params: Record<string, any>) => Promise<any>
  ): void {
    this.plugins.set(pluginKey, executor);
  }
}