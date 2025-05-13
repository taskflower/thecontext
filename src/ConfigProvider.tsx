// src/ConfigProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  lazy,
  useMemo,
} from "react";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

// Obiekt cache dla komponentów
const componentCache = new Map<string, React.LazyExoticComponent<any>>();

type ModuleType = "component" | "layout" | "widget";
type ModuleImport = () => Promise<{ default: React.ComponentType<any> }>;

// Cache dla zaimportowanych modułów
const moduleImports: Record<ModuleType, Record<string, ModuleImport>> = {
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

// Funkcja pomocnicza do ładowania i cachowania modułów
const loadModule = (type: ModuleType, tplDir: string, name: string) => {
  const cacheKey = `${type}:${tplDir}/${name}`;

  // Sprawdzenie czy komponent jest już w cache
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  // Przygotowanie ścieżek do modułów - próba w katalogu szablonu i katalogu domyślnym
  const paths = [
    `./themes/${tplDir}/${type}s/${name}.tsx`,
    `./themes/default/${type}s/${name}.tsx`,
  ];

  // Znalezienie pierwszej dostępnej ścieżki
  const path = paths.find((p) => moduleImports[type][p]);
  if (!path) {
    throw new Error(`Module not found: ${name} in ${tplDir} (${type})`);
  }

  // Leniwe ładowanie komponentu
  const component = lazy(() => moduleImports[type][path]());

  // Zapisanie do cache i zwrócenie
  componentCache.set(cacheKey, component);
  return component;
};

// Obiekt preloadModules zoptymalizowany
export const preloadModules = {
  component: (tplDir: string, name: string) =>
    loadModule("component", tplDir, name),
  layout: (tplDir: string, name: string) => loadModule("layout", tplDir, name),
  widget: (tplDir: string, name: string) => loadModule("widget", tplDir, name),
};

// Pomocnicza funkcja do pobrania configId z URL
export const getConfigIdFromURL = (): string =>
  window.location.pathname.split("/").filter(Boolean)[0] || "energyGrantApp";

// Cache dla załadowanych konfiguracji
const configCache = new Map<string, Promise<AppConfig>>();

// Zoptymalizowana funkcja do ładowania konfiguracji JSON
export const loadJsonConfigs = async (slug: string): Promise<AppConfig> => {
  // Sprawdzenie czy konfiguracja jest już ładowana lub załadowana
  if (configCache.has(slug)) {
    return configCache.get(slug)!;
  }

  // Importy modułów konfiguracyjnych
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

  // Ścieżka do pliku app.json
  const appPath = `./configs/${slug}/app.json`;
  const appLoader = configs.app[appPath];
  if (!appLoader) throw new Error(`Missing config: ${appPath}`);

  // Tworzenie promesa konfiguracji
  const configPromise = (async () => {
    const app = await appLoader();

    // Funkcja do ładowania elementów konfiguracji (workspaces, scenarios)
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

    // Równoległe ładowanie workspaces i scenarios
    const [workspaces, scenarios] = await Promise.all([
      loadItems<WorkspaceConfig>(app.workspaces, "workspaces"),
      loadItems<ScenarioConfig>(app.scenarios, "scenarios"),
    ]);

    // Zwrócenie kompletnej konfiguracji
    return {
      name: app.name,
      description: app.description,
      tplDir: app.tplDir,
      workspaces,
      scenarios,
    };
  })();

  // Zapisanie promesa do cache
  configCache.set(slug, configPromise);
  return configPromise;
};

// Interfejs kontekstu konfiguracji
interface ConfigContextValue {
  config: AppConfig | null;
  configType: "local" | "firebase" | "documentdb" | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
  preload: typeof preloadModules;
}

// Utworzenie kontekstu z wartościami domyślnymi
const ConfigContext = createContext<ConfigContextValue>({
  config: null,
  configType: null,
  configId: null,
  loading: false,
  error: null,
  preload: preloadModules,
});

// Dostawca kontekstu konfiguracji
export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ConfigContextValue>({
    config: null,
    configType: null,
    configId: null,
    loading: true,
    error: null,
    preload: preloadModules,
  });

  // Efekt ładowania konfiguracji przy montowaniu
  useEffect(() => {
    const slug = getConfigIdFromURL();
    let isMounted = true;

    (async () => {
      try {
        // 1) Spróbuj załadować lokalnie
        const config = await loadJsonConfigs(slug);
        if (isMounted) {
          setState({
            config,
            configType: "documentdb",
            configId: slug,
            loading: false,
            error: null,
            preload: preloadModules,
          });
        }
      } catch {
        console.warn("Nie znaleziono konfiguracji lokalnej, próbuję Firebase…");

        if (!isMounted) return;

        try {
          // 2) Fallback do Firestore
          const { FirebaseAdapter } = await import(
            "./provideDB/firebase/FirebaseAdapter"
          );
          const adapter = new FirebaseAdapter("application_configs");
          const saved = await adapter.retrieveData(slug);

          if (!isMounted) return;

          if (saved?.payload) {
            setState({
              config: saved.payload as AppConfig,
              configType: "firebase",
              configId: slug,
              loading: false,
              error: null,
              preload: preloadModules,
            });
            return;
          }

          throw new Error("Brak payload w dokumencie Firestore");
        } catch (fbErr) {
          console.error("Błąd ładowania z Firebase", fbErr);

          if (isMounted) {
            setState((current) => ({
              ...current,
              configId: slug,
              loading: false,
              error: "Nie udało się załadować konfiguracji",
              preload: preloadModules,
            }));
          }
        }
      }
    })();

    // Czyszczenie efektu
    return () => {
      isMounted = false;
    };
  }, []);

  // Stabilna wartość preload
  const preload = useMemo(() => preloadModules, []);

  // Zoptymalizowana wartość kontekstu - unika zbędnych rerenderów
  const contextValue = useMemo(
    () => ({
      ...state,
      preload,
    }),
    [state, preload]
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook do korzystania z kontekstu konfiguracji
export const useConfig = () => useContext(ConfigContext);
