import { Plugin } from './types';

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  // Rejestracja nowego pluginu
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.config.id)) {
      console.warn(`Plugin z ID ${plugin.config.id} już istnieje i zostanie nadpisany`);
    }
    
    this.plugins.set(plugin.config.id, plugin);
  }

  // Pobranie pluginu po ID
  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  // Pobranie wszystkich zarejestrowanych pluginów
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // Usunięcie pluginu
  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  // Wyczyszczenie całego rejestru
  clear(): void {
    this.plugins.clear();
  }
}

// Singleton rejestru pluginów
export const pluginRegistry = new PluginRegistry();