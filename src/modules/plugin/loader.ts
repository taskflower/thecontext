/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/loader.ts
import { usePluginStore } from "./store";
import { Plugin } from "./types";

export const loadPlugins = async () => {
  const store = usePluginStore.getState();
  
  // Dynamiczny import wszystkich pluginów - zachowujemy oryginalną ścieżkę
  const pluginModules = import.meta.glob("./../../plugins/*/index.tsx", {
    eager: true,
  });

  console.log("Available plugin modules:", Object.keys(pluginModules));

  Object.values(pluginModules).forEach((module: any) => {
    // Sprawdzamy czy eksport pluginu jest w nowym formacie
    if (module.default?.id && typeof module.default.process === 'function') {
      const plugin = module.default as Plugin;
      console.log(`Registering plugin: ${plugin.name}`);
      store.registerPlugin(plugin);
    } 
    // Kompatybilność wsteczna ze starym formatem
    else if (module.default?.config?.id && typeof module.default.process === 'function') {
      const oldPlugin = module.default;
      // Konwertuj stary format do nowego
      const plugin: Plugin = {
        id: oldPlugin.config.id,
        name: oldPlugin.config.name,
        description: oldPlugin.config.description,
        version: oldPlugin.config.version,
        options: oldPlugin.config.optionsSchema,
        process: oldPlugin.process
      };
      console.log(`Registering legacy plugin: ${plugin.name}`);
      store.registerPlugin(plugin);
    } 
    else {
      console.warn("Found module that doesn't export a valid plugin:", module);
    }
  });

  console.log(`Loaded ${Object.keys(store.plugins).length} plugins`);
};