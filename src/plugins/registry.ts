// src/plugins/registry.ts
import { pluginManager } from './pluginManager';
import { PluginRegistration } from './types';

/**
 * Rejestruje wtyczkę w systemie
 */
export function registerPlugin(plugin: PluginRegistration): void {
  pluginManager.registerPlugin(plugin);
  console.log(`Zarejestrowano wtyczkę: ${plugin.id} (${plugin.name})`);
}

// Dynamicznie importuj wszystkie wtyczki
export async function loadAllPlugins(): Promise<void> {
  try {
    console.log(`Ładowanie wtyczek...`);
    
    // Ręczne importowanie wtyczek
    await Promise.all([
      import('./textInput/index'),
      import('./examplePlugin/index') // Dodajemy nowy plugin Example
    ]);
    
    console.log(`Załadowano ${pluginManager.getAllPlugins().length} wtyczek`);
  } catch (error) {
    console.error('Błąd podczas ładowania wtyczek:', error);
  }
}