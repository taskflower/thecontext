import React, {createContext, useContext, useEffect, useState, lazy} from "react";
import create from "zustand";
import type {AppConfig, WorkspaceConfig, ScenarioConfig} from '@/core/types';

const moduleTypes = ['component', 'layout', 'widget'] as const;
type ModuleType = typeof moduleTypes[number];

const useComponentCache = create<{
  components: Record<string, React.LazyExoticComponent<any>>;
  getOrCreate: (key: string, loader: () => Promise<any>) => React.LazyExoticComponent<any>;
}>((set, get) => ({
  components: {},
  getOrCreate: (k, l) => {
    const c = get().components; if(c[k]) return c[k];
    const comp = lazy(l); set(s => ({components: {...s.components, [k]: comp}}));
    return comp;
  }
}));

const modules = {
  component: import.meta.glob("./themes/*/components/*.tsx"),
  layout: import.meta.glob("./themes/*/layouts/*.tsx"),
  widget: import.meta.glob("./themes/*/widgets/*.tsx")
};

const preload = (t: ModuleType, d: string, n: string) => useComponentCache.getState().getOrCreate(
  `${t}:${d}/${n}`, () => {
    const p = [`./themes/${d}/${t}s/${n}.tsx`, `./themes/default/${t}s/${n}.tsx`].find(p => modules[t][p]);
    if(!p) throw new Error(`Module not found: ${n} in ${d}`); return modules[t][p]();
  }
);

export const preloadModules = {
  component: (t: string, n: string) => preload('component', t, n),
  layout: (t: string, n: string) => preload('layout', t, n),
  widget: (t: string, n: string) => preload('widget', t, n)
};

export const getConfigIdFromURL = (): string => 
  window.location.pathname.split('/').filter(Boolean)[0] || 'energyGrantApp';

export const loadJsonConfigs = async (s: string): Promise<AppConfig> => {
  const cfgs = {
    app: import.meta.glob<Record<string, any>>('./configs/*/app.json', {as: 'json'}),
    ws: import.meta.glob<Record<string, any>>('./configs/*/workspaces/*.json', {as: 'json'}),
    sc: import.meta.glob<Record<string, any>>('./configs/*/scenarios/*.json', {as: 'json'})
  };
  
  const p = `./configs/${s}/app.json`;
  const app = await cfgs.app[p]?.() || (() => {throw new Error(`Missing: ${p}`);})();

  const load = async <T extends object>(
    items: Array<{id: string}>, 
    t: 'workspaces' | 'scenarios'
  ): Promise<Array<T & {slug: string}>> => Promise.all(
    items.map(async ({id}) => {
      const path = `./configs/${s}/${t}/${id}.json`;
      const data = await (t === 'workspaces' ? cfgs.ws : cfgs.sc)[path]?.() || 
        (() => {throw new Error(`Missing ${t}: ${path}`);})();
      return {...data, slug: id} as T & {slug: string};
    })
  );

  const [ws, sc] = await Promise.all([
    load<WorkspaceConfig>(app.workspaces, 'workspaces'),
    load<ScenarioConfig>(app.scenarios, 'scenarios')
  ]);

  return {name: app.name, description: app.description, tplDir: app.tplDir, workspaces: ws, scenarios: sc};
};

interface ConfigContextValue {
  config: AppConfig | null;
  configType: "local" | "firebase" | "documentdb" | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
  preload: typeof preloadModules;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: null, configType: null, configId: null,
  loading: false, error: null, preload: preloadModules
});

export const ConfigProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [s, setS] = useState<{
    config: AppConfig | null;
    configType: "local" | "firebase" | "documentdb" | null;
    configId: string | null;
    loading: boolean;
    error: string | null;
  }>({config: null, configType: null, configId: null, loading: true, error: null});

  useEffect(() => {
    const slug = getConfigIdFromURL();
    (async () => {
      try {
        setS({config: await loadJsonConfigs(slug), configType: "documentdb", 
              configId: slug, loading: false, error: null});
      } catch (e) {
        console.error("Config error", e);
        setS(c => ({...c, configId: slug, loading: false, error: "Failed to load"}));
      }
    })();
  }, []);

  return <ConfigContext.Provider value={{...s, preload: preloadModules}}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);