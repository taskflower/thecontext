import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { AppConfig } from "@/core/types";
import { getConfigIdFromURL, loadJsonConfigs, preloadModules } from ".";

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

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configType, setConfigType] = useState<
    "local" | "firebase" | "documentdb" | null
  >(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Important note: ConfigProvider works before Router, so useParams/useLocation
  // will not work directly in this component

  useEffect(() => {
    const slug = getConfigIdFromURL();
    setConfigId(slug);

    const loadConfig = async () => {
      try {
        setLoading(true);
        const appConfig = await loadJsonConfigs(slug);
        setConfig(appConfig);
        setConfigType("documentdb");
        setError(null);
      } catch (err: any) {
        console.error("Configuration loading error", err);
        setError("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const contextValue = useMemo(
    () => ({
      config,
      configType,
      configId,
      loading,
      error,
      preload: preloadModules,
    }),
    [config, configType, configId, loading, error]
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
