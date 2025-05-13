// src/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { AppConfig, WorkspaceConfig, ScenarioConfig } from '@/core/types';

interface ConfigContextValue {
  config: AppConfig | null;
  configType: 'local' | 'firebase' | 'documentdb' | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: null,
  configType: null,
  configId: null,
  loading: false,
  error: null,
});

interface ConfigProviderProps {
  children: ReactNode;
}

const getConfigIdFromURL = (): string => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  return pathSegments[0] || 'energyGrantApp';
};

const loadJsonConfigs = async (
  slug: string, 
  appImports: Record<string, () => Promise<any>>,
  wsImports: Record<string, () => Promise<any>>,
  scImports: Record<string, () => Promise<any>>
): Promise<AppConfig> => {
  // Load app.json
  const appPath = `./configs/${slug}/app.json`;
  const appLoader = appImports[appPath] as (() => Promise<any>);
  if (!appLoader) throw new Error(`Missing config file: ${appPath}`);
  const appData = await appLoader();

  // Load workspaces
  const workspaces: WorkspaceConfig[] = await Promise.all(
    appData.workspaces.map(async (wsRef: { id: string }) => {
      const workspaceId = wsRef.id;
      const wsPath = `./configs/${slug}/workspaces/${workspaceId}.json`;
      const wsLoader = wsImports[wsPath] as (() => Promise<any>);
      if (!wsLoader) throw new Error(`Missing workspace: ${wsPath}`);
      const wsRaw = (await wsLoader()) as Omit<WorkspaceConfig, 'slug'>;
      return { ...wsRaw, slug: workspaceId };
    })
  );

  // Load scenarios
  const scenarios: ScenarioConfig[] = await Promise.all(
    appData.scenarios.map(async (scRef: { id: string }) => {
      const scenarioId = scRef.id;
      const scPath = `./configs/${slug}/scenarios/${scenarioId}.json`;
      const scLoader = scImports[scPath] as (() => Promise<any>);
      if (!scLoader) throw new Error(`Missing scenario: ${scPath}`);
      const scRaw = (await scLoader()) as Omit<ScenarioConfig, 'slug'>;
      return { ...scRaw, slug: scenarioId };
    })
  );

  // Build configuration
  return {
    name: appData.name,
    description: appData.description,
    tplDir: appData.tplDir,
    workspaces,
    scenarios,
  };
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configType, setConfigType] = useState<'local' | 'firebase' | 'documentdb' | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = getConfigIdFromURL();
    setConfigId(slug);

    const appImports = import.meta.glob('./configs/*/app.json', { as: 'json' });
    const wsImports = import.meta.glob('./configs/*/workspaces/*.json', { as: 'json' });
    const scImports = import.meta.glob('./configs/*/scenarios/*.json', { as: 'json' });

    const loadConfig = async () => {
      try {
        setLoading(true);
        const appConfig = await loadJsonConfigs(slug, appImports, wsImports, scImports);
        setConfig(appConfig);
        setConfigType('documentdb');
        setError(null);
      } catch (err: any) {
        console.error('Configuration loading error', err);
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    config,
    configType,
    configId,
    loading,
    error
  }), [config, configType, configId, loading, error]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
