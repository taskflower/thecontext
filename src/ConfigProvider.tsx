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
const NotFoundComponent = (props: any) => (
  <div className="fallback text-xs p-4 text-gray-600">
    <span className="font-semibold">Nie znaleziono:</span> {props.componentType}{" "}
    {props.componentName} w szablonie {props.tplDir}
  </div>
);

// Cache komponentów i importy dynamiczne
const componentCache = new Map<string, React.LazyExoticComponent<any>>();
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

// Ładowanie modułu w cache lub fallback
const loadModule = (
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
) => {
  const cacheKey = `${type}:${tplDir}/${name}`;
  if (componentCache.has(cacheKey)) return componentCache.get(cacheKey)!;

  const paths = [
    `./themes/${tplDir}/${type}s/${name}.tsx`,
    `./themes/default/${type}s/${name}.tsx`,
  ];

  const path = paths.find((p) => moduleImports[type][p]);
  const component = path
    ? lazy(moduleImports[type][path])
    : lazy(() =>
        Promise.resolve({
          default: (props: any) => (
            <NotFoundComponent
              componentName={name}
              tplDir={tplDir}
              componentType={type}
              {...props}
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
  layout: (tplDir: string, name: string) =>
    loadModule("layout", tplDir, name),
  widget: (tplDir: string, name: string) =>
    loadModule("widget", tplDir, name),
};

// Pobieranie configId z URL
export const getConfigIdFromURL = (path: string) =>
  path.split("/").filter(Boolean)[0] || "energyGrantApp";

// Cache konfiguracji
const configCache = new Map<string, Promise<AppConfig>>();

// Auto-discovery loadJsonConfigs
export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
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
      // Załaduj app.json
      const appPath = `./configs/${slug}/app.json`;
      const appLoader = configs.app[appPath];
      if (!appLoader) throw new Error(`Brak configu: ${appPath}`);
      const app = await appLoader();

      // Auto-discovery workspace'ów
      const workspacePaths = Object.keys(configs.ws).filter((path) =>
        path.startsWith(`./configs/${slug}/workspaces/`)
      );
      const workspaces: WorkspaceConfig[] = await Promise.all(
        workspacePaths.map(async (path) => {
          try {
            const data = await configs.ws[path]();
            const match = path.match(new RegExp(`.*/workspaces/(.+)\\.json$`));
            const id = match ? match[1] : undefined;
            return { ...(data as WorkspaceConfig), slug: id! };
          } catch (err) {
            console.error(`Błąd ładowania workspace z ${path}:`, err);
            const match = path.match(new RegExp(`.*/workspaces/(.+)\\.json$`));
            const id = match ? match[1] : "";
            return { slug: id } as WorkspaceConfig;
          }
        })
      );

      // Auto-discovery scenariuszy
      const scenarioPaths = Object.keys(configs.sc).filter((path) =>
        path.startsWith(`./configs/${slug}/scenarios/`)
      );
      const scenarios: ScenarioConfig[] = await Promise.all(
        scenarioPaths.map(async (path) => {
          try {
            const data = await configs.sc[path]();
            const match = path.match(new RegExp(`.*/scenarios/(.+)\\.json$`));
            const id = match ? match[1] : undefined;
            return { ...(data as ScenarioConfig), slug: id! };
          } catch (err) {
            console.error(`Błąd ładowania scenariusza z ${path}:`, err);
            const match = path.match(new RegExp(`.*/scenarios/(.+)\\.json$`));
            const id = match ? match[1] : "";
            return { slug: id } as ScenarioConfig;
          }
        })
      );

      // Zwrot kompletnej konfiguracji
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
  configType: string | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
  preload: typeof preloadModules;
  loadConfig: (configId: string) => Promise<void>;
}>({
  config: null,
  configType: null,
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
    configType: null as string | null,
    configId: null as string | null,
    loading: true,
    error: null as string | null,
  });

  const loadConfig = useCallback(async (slug: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const cfg = await loadJsonConfigs(slug);
      setState({ config: cfg, configType: "local", configId: slug, loading: false, error: null });
    } catch (fbErr: any) {
      console.error("Błąd ładowania configu JSON, próba Firebase…", fbErr);
      setState((s) => ({ ...s, configId: slug, loading: false, error: fbErr.message || "Nieznany błąd" }));
    }
  }, []);

  useEffect(() => {
    const slug = getConfigIdFromURL(location.pathname);
    if (slug !== state.configId || state.config === null) {
      loadConfig(slug);
    }
  }, [location.pathname, state.configId, state.config, loadConfig]);

  return (
    <ConfigContext.Provider value={{ ...state, preload: preloadModules, loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
