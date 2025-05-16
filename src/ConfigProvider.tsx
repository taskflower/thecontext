// src/ConfigProvider.tsx (Refactored)
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

// Fallback component for missing modules
const NotFoundComponent = (props: any) => (
  <div className="fallback text-xs p-4 text-gray-600">
    <span className="font-semibold">Nie znaleziono:</span> {props.componentType}{" "}
    {props.componentName} w szablonie {props.tplDir}
  </div>
);

// Component cache and module imports
const componentCache = new Map<string, React.LazyExoticComponent<any>>();
const moduleImports = {
  component: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/components/*.tsx"
  ),
  layout: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/layouts/*.tsx"
  ),
  widget: import.meta.glob<{ default: React.ComponentType<any> }>(
    "./themes/*/widgets/*.tsx"
  ),
};

// Load component module
const loadModule = (
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
) => {
  const cacheKey = `${type}:${tplDir}/${name}`;
  if (componentCache.has(cacheKey)) return componentCache.get(cacheKey)!;

  // Try to find module in template directory or fallback to default
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

// Preload module exports
export const preloadModules = {
  component: (tplDir: string, name: string) =>
    loadModule("component", tplDir, name),
  layout: (tplDir: string, name: string) => loadModule("layout", tplDir, name),
  widget: (tplDir: string, name: string) => loadModule("widget", tplDir, name),
};

// Extract config ID from URL
export const getConfigIdFromURL = (path: string) =>
  path.split("/").filter(Boolean)[0] || "energyGrantApp";

// Config cache
const configCache = new Map<string, Promise<AppConfig>>();

// Load JSON configs
export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  if (configCache.has(slug)) return configCache.get(slug)!;

  // Import all config files
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
      // Load app config
      const appPath = `./configs/${slug}/app.json`;
      const appLoader = configs.app[appPath];
      if (!appLoader) throw new Error(`Missing config: ${appPath}`);
      const app = await appLoader();

      // Helper to load config items
      const loadItems = async <T extends object>(
        items: Array<{ id: string }>,
        type: "workspaces" | "scenarios"
      ) => {
        const configType = type === "workspaces" ? configs.ws : configs.sc;
        return Promise.all(
          items.map(async ({ id }) => {
            try {
              const path = `./configs/${slug}/${type}/${id}.json`;
              const data = await configType[path]();
              return { ...(data as object), slug: id } as T & { slug: string };
            } catch (error) {
              console.error(`Error loading ${type} ${id}:`, error);
              return { slug: id } as T & { slug: string };
            }
          })
        );
      };

      // Load workspaces and scenarios
      const [workspaces, scenarios] = await Promise.all([
        loadItems<WorkspaceConfig>(app.workspaces || [], "workspaces"),
        loadItems<ScenarioConfig>(app.scenarios || [], "scenarios"),
      ]);

      // Return complete config
      return {
        name: app.name || "Aplikacja",
        description: app.description || "",
        tplDir: app.tplDir || "default",
        workspaces: workspaces as WorkspaceConfig[],
        scenarios: scenarios as ScenarioConfig[],
      } as AppConfig;
    } catch (error) {
      console.error("Error loading config:", error);
      throw error;
    }
  })();

  configCache.set(slug, configPromise);
  return configPromise;
};

// Config context
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

// Config provider component
export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [state, setState] = useState({
    config: null as AppConfig | null,
    configType: null as string | null,
    configId: null as string | null,
    loading: true,
    error: null as string | null,
  });

  // Load configuration from JSON or Firebase
  const loadConfig = useCallback(async (slug: string) => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      // Try to load from JSON first
      const config = await loadJsonConfigs(slug);
      setState({
        config,
        configType: "local",
        configId: slug,
        loading: false,
        error: null,
      });
    } catch (err) {
      // If JSON fails, try Firebase
      try {
        const { FirebaseAdapter } = await import(
          "./provideDB/firebase/FirebaseAdapter"
        );
        const adapter = new FirebaseAdapter("application_configs");
        const saved = await adapter.retrieveData(slug);

        if (saved?.payload) {
          setState({
            config: saved.payload as AppConfig,
            configType: "firebase",
            configId: slug,
            loading: false,
            error: null,
          });
          return;
        }

        throw new Error("Brak payload w dokumencie Firestore");
      } catch (fbErr: any) {
        setState((current) => ({
          ...current,
          configId: slug,
          loading: false,
          error: `Nie udało się załadować konfiguracji: ${
            fbErr?.message || "Nieznany błąd"
          }`,
        }));
      }
    }
  }, []);

  // Load config when URL changes
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
