// src/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, lazy } from "react";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

const componentCache = new Map<string, React.LazyExoticComponent<any>>();

type ModuleType = "component" | "layout" | "widget";

const modules: Record<ModuleType, Record<string, () => Promise<any>>> = {
  component: import.meta.glob("./themes/*/components/*.tsx"),
  layout:    import.meta.glob("./themes/*/layouts/*.tsx"),
  widget:    import.meta.glob("./themes/*/widgets/*.tsx"),
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
  layout:    (tplDir: string, name: string) => loadModule("layout", tplDir, name),
  widget:    (tplDir: string, name: string) => loadModule("widget", tplDir, name),
};

export const getConfigIdFromURL = (): string =>
  window.location.pathname.split("/").filter(Boolean)[0] || "energyGrantApp";

export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  const configs = {
    app: import.meta.glob<Record<string, any>>("./configs/*/app.json",        { as: "json" }),
    ws:  import.meta.glob<Record<string, any>>("./configs/*/workspaces/*.json",{ as: "json" }),
    sc:  import.meta.glob<Record<string, any>>("./configs/*/scenarios/*.json",{ as: "json" }),
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
        return { ...(data as object), slug: id } as T & { slug: string };
      })
    );
  };

  const [workspaces, scenarios] = await Promise.all([
    loadItems<WorkspaceConfig>(app.workspaces,  "workspaces"),
    loadItems<ScenarioConfig>(app.scenarios,    "scenarios"),
  ]);

  return {
    name:        app.name,
    description: app.description,
    tplDir:      app.tplDir,
    workspaces,
    scenarios,
  };
};

interface ConfigContextValue {
  config:     AppConfig | null;
  configType: "local" | "firebase" | "documentdb" | null;
  configId:   string | null;
  loading:    boolean;
  error:      string | null;
  preload:    typeof preloadModules;
}

const ConfigContext = createContext<ConfigContextValue>({
  config:     null,
  configType: null,
  configId:   null,
  loading:    false,
  error:      null,
  preload:    preloadModules,
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfigContextValue>({
    config:     null,
    configType: null,
    configId:   null,
    loading:    true,
    error:      null,
    preload:    preloadModules,
  });

  useEffect(() => {
    const slug = getConfigIdFromURL();

    (async () => {
      try {
        // 1) Spróbuj załadować lokalnie
        const config = await loadJsonConfigs(slug);
        setState({ config, configType: "documentdb", configId: slug, loading: false, error: null, preload: preloadModules });
      } catch {
        console.warn("Nie znaleziono konfiguracji lokalnej, próbuję Firebase…");
        try {
          // 2) Fallback do Firestore
          const { FirebaseAdapter } = await import("./provideDB/firebase/FirebaseAdapter");
          const adapter = new FirebaseAdapter("application_configs");
          const saved = await adapter.retrieveData(slug);
          if (saved?.payload) {
            setState({ config: saved.payload as AppConfig, configType: "firebase", configId: slug, loading: false, error: null, preload: preloadModules });
            return;
          }
          throw new Error("Brak payload w dokumencie Firestore");
        } catch (fbErr) {
          console.error("Błąd ładowania z Firebase", fbErr);
          setState(current => ({ ...current, configId: slug, loading: false, error: "Nie udało się załadować konfiguracji", preload: preloadModules }));
        }
      }
    })();
  }, []);

  return <ConfigContext.Provider value={state}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);
