/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/plugin-loader.ts
import { Plugin } from "./types";
import { pluginRegistry } from "./plugin-registry";

// Function to automatically register plugins
export const loadPlugins = () => {
  // Vite dynamic import - uses globby to import all files from a specific directory
  // This code automatically imports all files in the plugins/ directory that match the pattern
  const pluginModules = import.meta.glob("./../../plugins/*.ts", {
    eager: true,
  });

  console.log("Available plugin modules:", Object.keys(pluginModules));

  // Process each imported module
  Object.values(pluginModules).forEach((module: any) => {
    // Check if the module exports a plugin class by default
    if (
      module.default &&
      typeof module.default === "object" &&
      "config" in module.default &&
      "process" in module.default
    ) {
      const plugin = module.default as Plugin;
      console.log(`Registering plugin: ${plugin.config.name}`);
      pluginRegistry.register(plugin);
    } else {
      console.warn(
        "Found a module that does not export a valid plugin:",
        module
      );
    }
  });

  console.log(`Loaded ${pluginRegistry.getAllPlugins().length} plugins`);
};
