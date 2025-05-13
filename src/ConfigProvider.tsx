// src/ConfigProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  lazy,
} from "react";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

// Prosta mapa cache zamiast zustand store
const componentCache = new Map<string, React.LazyExoticComponent<any>>();

type ModuleType = "component" | "layout" | "widget";

const modules: Record<ModuleType, Record<string, () => Promise<any>>> = {
  component: import.meta.glob("./themes/*/components/*.tsx"),
  layout: import.meta.glob("./themes/*/layouts/*.tsx"),
  widget: import.meta.glob("./themes/*/widgets/*.tsx"),
};

const loadModule = (type: ModuleType, tplDir: string, name: string) => {
  const cacheKey = `${type}:${tplDir}/${name}`;
  
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }
  
  const paths = [
    `./themes/${tplDir}/${type}s/${name}.tsx`,
    `./themes/default/${type}s/${name}.tsx`,
  ];
  
  const path = paths.find((p) => modules[type][p]);
  if (!path) {
    throw new Error(`Module not found: ${name} in ${tplDir} (${type})`);
  }
  
  const component = lazy(() => modules[type][path]());
  componentCache.set(cacheKey, component);
  return component;
};

export const preloadModules = {
  component: (tplDir: string, name: string) => loadModule("component", tplDir, name),
  layout: (tplDir: string, name: string) => loadModule("layout", tplDir, name),
  widget: (tplDir: string, name: string) => loadModule("widget", tplDir, name),
};

export const getConfigIdFromURL = (): string =>
  window.location.pathname.split("/").filter(Boolean)[0] || "energyGrantApp";

export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  const configs = {
    app: import.meta.glob<Record<string, any>>("./configs/*/app.json", {
      as: "json",
    }),
    ws: import.meta.glob<Record<string, any>>("./configs/*/workspaces/*.json", {
      as: "json",
    }),
    sc: import.meta.glob<Record<string, any>>("./configs/*/scenarios/*.json", {
      as: "json",
    }),
  };

  const appPath = `./configs/${slug}/app.json`;
  const appLoader = configs.app[appPath];
  if (!appLoader) throw new Error(`Missing config: ${appPath}`);
  const app = await appLoader();

  const loadItems = async <T extends object>(
    items: Array<{ id: string }>,
    type: "workspaces" | "scenarios"
  ): Promise<Array<T & { slug: string }>> => {
    const configType = type === "workspaces" ? configs.ws : configs.sc;

    return Promise.all(
      items.map(async ({ id }) => {
        const path = `./configs/${slug}/${type}/${id}.json`;
        const loader = configType[path];
        if (!loader) throw new Error(`Missing ${type}: ${path}`);
        const data = (await loader()) as T;
        return { ...data, slug: id };
      })
    );
  };

  const [workspaces, scenarios] = await Promise.all([
    loadItems<WorkspaceConfig>(app.workspaces, "workspaces"),
    loadItems<ScenarioConfig>(app.scenarios, "scenarios"),
  ]);

  return {
    name: app.name,
    description: app.description,
    tplDir: app.tplDir,
    workspaces,
    scenarios,
  };
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
  config: null,
  configType: null,
  configId: null,
  loading: false,
  error: null,
  preload: preloadModules,
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<{
    config: AppConfig | null;
    configType: "local" | "firebase" | "documentdb" | null;
    configId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    config: null,
    configType: null,
    configId: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const slug = getConfigIdFromURL();

    (async () => {
      try {
        const config = await loadJsonConfigs(slug);
        setState({
          config,
          configType: "documentdb",
          configId: slug,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Config error", error);
        setState((current) => ({
          ...current,
          configId: slug,
          loading: false,
          error: "Failed to load config",
        }));
      }
    })();
  }, []);

  return (
    <ConfigContext.Provider value={{ ...state, preload: preloadModules }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);