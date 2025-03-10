// src/utils/pluginInstaller.ts

  // import { loadPlugin } from "./loadPlugin";
  // import { usePluginStore } from "./store";
  // import { PluginModule } from "./types";

  // // Helper for installing bundled or local plugins
  // export const usePluginInstaller = () => {
  //   const { registerPlugin } = usePluginStore();

  //   // Install bundled plugins for development
  //   const installDevPlugins = async (): Promise<void> => {
  //     if (!import.meta.env.DEV) return;

  //     try {
  //       // Import local example plugin using Vite dynamic import
  //       const dataProcessorPlugin = (await import("../plugins/data-processor"))
  //         .default as PluginModule;
  //       registerPlugin(dataProcessorPlugin.id, dataProcessorPlugin);

  //       console.log("Development plugins installed");
  //     } catch (error) {
  //       console.error("Failed to install development plugins:", error);
  //     }
  //   };

  //   // Install remote plugins for production
  //   const installRemotePlugin = async (url: string): Promise<string> => {
  //     try {
  //       const plugin = await loadPlugin(url);
  //       registerPlugin(plugin.id, plugin);
  //       return plugin.id;
  //     } catch (error) {
  //       console.error(`Failed to install plugin from ${url}:`, error);
  //       throw error;
  //     }
  //   };

  //   return {
  //     installDevPlugins,
  //     installRemotePlugin,
  //   };
  // };


  export * from './autoLoader';