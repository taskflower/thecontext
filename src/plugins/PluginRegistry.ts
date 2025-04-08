import { Node } from '@/store/types';
import { NodePlugin, ValidationResult } from './types';

export class PluginRegistry {
  private plugins: Map<string, NodePlugin> = new Map();
  
  register(plugin: NodePlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin o ID ${plugin.id} już istnieje i zostanie nadpisany.`);
    }
    this.plugins.set(plugin.id, plugin);
  }
  
  registerAll(plugins: NodePlugin[]): void {
    plugins.forEach(plugin => this.register(plugin));
  }
  
  getPlugin(pluginType: string): NodePlugin | undefined {
    return this.plugins.get(pluginType);
  }
  
  getAllPlugins(): NodePlugin[] {
    return Array.from(this.plugins.values());
  }
  
  transformNode(node: Node): Node {
    if (!node.pluginType) return node;
    
    const plugin = this.getPlugin(node.pluginType);
    if (!plugin) {
      console.warn(`Plugin "${node.pluginType}" nie został znaleziony dla węzła ${node.id}`);
      return node;
    }
    
    try {
      return plugin.transformNode(node);
    } catch (error) {
      console.error(`Błąd podczas transformacji węzła ${node.id} pluginem ${node.pluginType}:`, error);
      return node;
    }
  }
  
  validateNodePluginData(node: Node): ValidationResult {
    if (!node.pluginType) {
      return { isValid: true };
    }
    
    const plugin = this.getPlugin(node.pluginType);
    if (!plugin) {
      return { 
        isValid: false, 
        errors: [`Plugin "${node.pluginType}" nie został znaleziony`]
      };
    }
    
    return plugin.validateNodeData(node.pluginData || {});
  }
}

export const pluginRegistry = new PluginRegistry();