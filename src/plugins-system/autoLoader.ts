import { PluginInterface } from './PluginInterface';
import { usePluginStore } from './store';

interface PluginModule {
  default: unknown;
}

export const loadAllPlugins = async (): Promise<void> => {
  const { registerPlugin } = usePluginStore.getState();

  try {
    const pluginModules = import.meta.glob<PluginModule>('../plugins/*/index.ts', { eager: true });
    
    for (const path in pluginModules) {
      const module = pluginModules[path];
      
      if (module.default instanceof PluginInterface) {
        const plugin = module.default;
        console.log(`Automatycznie załadowano wtyczkę: ${plugin.name} (${plugin.id})`);
        registerPlugin(plugin.id, plugin);
      } else {
        console.warn(`Moduł pod ścieżką ${path} nie eksportuje poprawnej wtyczki`);
      }
    }
    
    console.log('Zakończono ładowanie wtyczek');
  } catch (error) {
    console.error('Błąd podczas ładowania wtyczek:', error);
  }
};

export const usePluginInstaller = () => {
  const { registerPlugin } = usePluginStore();

  const installDevPlugins = async (): Promise<void> => {
    if (!import.meta.env.DEV) return;
    
    try {
      await loadAllPlugins();
    } catch (error) {
      console.error("Błąd podczas instalacji wtyczek:", error);
    }
  };

  const installRemotePlugin = async (url: string): Promise<string> => {
    try {
      const moduleImport = await import(/* @vite-ignore */ url);
      const plugin = moduleImport.default;
      
      if (plugin instanceof PluginInterface) {
        registerPlugin(plugin.id, plugin);
        return plugin.id;
      } else {
        throw new Error('Pobrany moduł nie jest poprawną wtyczką');
      }
    } catch (error) {
      console.error(`Błąd podczas instalacji wtyczki z ${url}:`, error);
      throw error;
    }
  };

  return {
    installDevPlugins,
    installRemotePlugin,
  };
};