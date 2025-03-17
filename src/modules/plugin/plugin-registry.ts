import { Plugin } from "./types";

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.config.id)) {
      console.warn(
        `Plugin z ID ${plugin.config.id} już istnieje i zostanie nadpisany`
      );
    }

    this.plugins.set(plugin.config.id, plugin);
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const pluginRegistry = new PluginRegistry();
