/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/plugin-loader.ts
import { Plugin } from "./types";
import { pluginRegistry } from "./plugin-registry";

export const loadPlugins = () => {
  // Zmieniona ścieżka glob - szukamy plików index.tsx w podfolderach plugins
  const pluginModules = import.meta.glob("./../../plugins/*/index.tsx", {
    eager: true,
  });

  console.log("Dostępne moduły pluginów:", Object.keys(pluginModules));

  Object.values(pluginModules).forEach((module: any) => {
    if (
      module.default &&
      typeof module.default === "object" &&
      "config" in module.default &&
      "process" in module.default
    ) {
      const plugin = module.default as Plugin;
      console.log(`Rejestrowanie pluginu: ${plugin.config.name}`);
      pluginRegistry.register(plugin);
    } else {
      console.warn(
        "Znaleziono moduł, który nie eksportuje poprawnego pluginu:",
        module
      );
    }
  });

  console.log(`Załadowano ${pluginRegistry.getAllPlugins().length} pluginów`);
};