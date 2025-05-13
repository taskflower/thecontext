import { lazy } from "react";
import create from "zustand";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from '@/core/types';

// Component cache store
interface CacheState {
  components: Record<string, React.LazyExoticComponent<any>>;
  getOrCreate: (key: string, loader: () => Promise<{ default: React.ComponentType<any> }>) => React.LazyExoticComponent<any>;
}

const useComponentCache = create<CacheState>((set, get) => ({
  components: {},
  getOrCreate: (key, loader) => {
    const { components } = get();
    if (components[key]) return components[key];
    const comp = lazy(loader);
    set(state => ({ components: { ...state.components, [key]: comp } }));
    return comp;
  }
}));

// Unified modules structure
const moduleTypes = ['component', 'layout', 'widget'] as const;
type ModuleType = typeof moduleTypes[number];

const modules: Record<ModuleType, Record<string, () => Promise<any>>> = {
  component: import.meta.glob("./themes/*/components/*.tsx"),
  layout: import.meta.glob("./themes/*/layouts/*.tsx"),
  widget: import.meta.glob("./themes/*/widgets/*.tsx")
};

// Core preload function
const preload = (type: ModuleType, tplDir: string, name: string) => {
  const paths = [
    `./themes/${tplDir}/${type}s/${name}.tsx`,
    `./themes/default/${type}s/${name}.tsx`
  ];
  
  return useComponentCache.getState().getOrCreate(
    `${type}:${tplDir}/${name}`, 
    () => {
      const path = paths.find(p => modules[type][p]);
      if (!path) throw new Error(`Module not found: ${name} in ${tplDir}`);
      return modules[type][path]();
    }
  );
};

// Exposed preload functions
export const preloadModules = {
  component: (tpl: string, name: string) => preload('component', tpl, name),
  layout: (tpl: string, name: string) => preload('layout', tpl, name),
  widget: (tpl: string, name: string) => preload('widget', tpl, name)
};

// Config utilities
export const getConfigIdFromURL = (): string => 
  window.location.pathname.split('/').filter(Boolean)[0] || 'energyGrantApp';

// Load configuration
export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  // Import all configs
  const configs = {
    app: import.meta.glob<Record<string, any>>('./configs/*/app.json', { as: 'json' }),
    ws: import.meta.glob<Record<string, any>>('./configs/*/workspaces/*.json', { as: 'json' }),
    sc: import.meta.glob<Record<string, any>>('./configs/*/scenarios/*.json', { as: 'json' })
  };
  
  // Load app config
  const appPath = `./configs/${slug}/app.json`;
  const appLoader = configs.app[appPath];
  if (!appLoader) throw new Error(`Missing config: ${appPath}`);
  const app = await appLoader();

  // Helper for loading sub-configs
  const loadItems = async <T extends object>(
    items: Array<{ id: string }>, 
    type: 'workspaces' | 'scenarios'
  ): Promise<Array<T & { slug: string }>> => {
    const configType = type === 'workspaces' ? configs.ws : configs.sc;
    
    return Promise.all(
      items.map(async ({ id }) => {
        const path = `./configs/${slug}/${type}/${id}.json`;
        const loader = configType[path];
        if (!loader) throw new Error(`Missing ${type}: ${path}`);
        const data = await loader() as T;
        return { ...data, slug: id };
      })
    );
  };

  // Load workspaces and scenarios in parallel
  const [workspaces, scenarios] = await Promise.all([
    loadItems<WorkspaceConfig>(app.workspaces, 'workspaces'),
    loadItems<ScenarioConfig>(app.scenarios, 'scenarios')
  ]);

  // Return final config
  return {
    name: app.name,
    description: app.description,
    tplDir: app.tplDir,
    workspaces,
    scenarios
  };
};