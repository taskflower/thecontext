// src/ConfigProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  lazy,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

// Fallback component dla brakujących modułów
const NotFoundComponent = ({ componentType, componentName, tplDir }: any) => (
  <div className="fallback text-xs p-4 text-gray-600">
    <span className="font-semibold">Nie znaleziono:</span> {componentType}{" "}
    {componentName} w szablonie {tplDir}
  </div>
);

// Cache komponentów i importy dynamiczne
const moduleImports = {
  component: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/components/*.tsx",
    { as: "module" }
  ),
  layout: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/layouts/*.tsx",
    { as: "module" }
  ),
  widget: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/widgets/*.tsx",
    { as: "module" }
  ),
};

const componentCache = new Map<string, React.LazyExoticComponent<any>>();

// Ładowanie modułu w cache lub fallback
const loadModule = (
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
) => {
  const cacheKey = `${type}:${tplDir}/${name}`;
  if (componentCache.has(cacheKey)) return componentCache.get(cacheKey)!;

  const path = [
    `./themes/${tplDir}/${type}s/${name}.tsx`,
    `./themes/default/${type}s/${name}.tsx`,
  ].find((p) => moduleImports[type][p]);

  const component = path
    ? lazy(moduleImports[type][path])
    : lazy(() =>
        Promise.resolve({
          default: (props: any) => (
            <NotFoundComponent
              {...props}
              componentName={name}
              tplDir={tplDir}
              componentType={type}
            />
          ),
        })
      );

  componentCache.set(cacheKey, component);
  return component;
};

// Eksport preloaderów
export const preloadModules = {
  component: (tplDir: string, name: string) =>
    loadModule("component", tplDir, name),
  layout: (tplDir: string, name: string) => loadModule("layout", tplDir, name),
  widget: (tplDir: string, name: string) => loadModule("widget", tplDir, name),
};

// Pobieranie configId z URL
export const getConfigIdFromURL = (path: string) =>
  path.split("/")[1] || "energyGrantApp";

// Cache konfiguracji
const configCache = new Map<string, Promise<AppConfig>>();

// Połączona metoda ładowania workspace'ów i scenariuszy
const loadConfigs = async (
  configType: "workspaces" | "scenarios",
  configs: any,
  slug: string
) => {
  const paths = Object.keys(configs).filter((path) =>
    path.startsWith(`./configs/${slug}/${configType}/`)
  );
  return Promise.all(
    paths.map(async (path) => {
      try {
        const data = await configs[path]();
        const id =
          path.match(new RegExp(`${configType}/(.+)\\.json$`))?.[1] || "";
        return { ...(data as WorkspaceConfig | ScenarioConfig), slug: id };
      } catch (err) {
        console.error(
          `Błąd ładowania ${configType.slice(0, -1)} z ${path}:`,
          err
        );
        return { slug: path.split("/").pop()?.replace(".json", "") || "" } as
          | WorkspaceConfig
          | ScenarioConfig;
      }
    })
  );
};

// Auto-discovery loadJsonConfigs
const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  if (configCache.has(slug)) return configCache.get(slug)!;

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

  const configPromise = (async () => {
    try {
      const app = await configs.app[`./configs/${slug}/app.json`]();
      const workspaces = await loadConfigs("workspaces", configs.ws, slug);
      const scenarios = await loadConfigs("scenarios", configs.sc, slug);

      return {
        name: app.name || "Aplikacja",
        description: app.description || "",
        tplDir: app.tplDir || "default",
        workspaces,
        scenarios,
        defaultWorkspace: app.defaultWorkspace,
        defaultScenario: app.defaultScenario,
      } as AppConfig;
    } catch (error) {
      console.error("Error loading config:", error);
      throw error;
    }
  })();

  configCache.set(slug, configPromise);
  return configPromise;
};

// Kontekst ConfigProvider
const ConfigContext = createContext<{
  config: AppConfig | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
  preload: typeof preloadModules;
  loadConfig: (configId: string) => Promise<void>;
}>({
  config: null,
  configId: null,
  loading: false,
  error: null,
  preload: preloadModules,
  loadConfig: async () => {},
});

// Provider komponentu
export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [state, setState] = useState({
    config: null as AppConfig | null,
    configId: null as string | null,
    loading: true,
    error: null as string | null,
  });

  const loadConfig = useCallback(
    async (slug: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const cfg = await loadJsonConfigs(slug);
        setState({ config: cfg, configId: slug, loading: false, error: null });
      } catch (fbErr: any) {
        console.error("Błąd ładowania configu JSON, próba Firebase…", fbErr);
        setState({
          ...state,
          configId: slug,
          loading: false,
          error: fbErr.message || "Nieznany błąd",
        });
      }
    },
    [state]
  );

  useEffect(() => {
    const slug = getConfigIdFromURL(location.pathname);
    if (slug !== state.configId || state.config === null) {
      loadConfig(slug);
    }
  }, [location.pathname, state.configId, state.config, loadConfig]);

  return (
    <ConfigContext.Provider
      value={{ ...state, preload: preloadModules, loadConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
