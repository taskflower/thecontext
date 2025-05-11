// src/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppConfig, WorkspaceConfig, ScenarioConfig } from './core/types';

interface ConfigContextValue {
  config: AppConfig | null;
  configType: 'local' | 'firebase' | null;
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

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configType, setConfigType] = useState<'local' | 'firebase' | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get('config') || 'googleAdsApp').trim();
    setConfigId(slug);

      // Prepare import globs for JSON configs
    const appImports = import.meta.glob('./configs/*/app.json', { as: 'json' });
    const wsImports = import.meta.glob('./configs/*/workspaces/*.json', { as: 'json' });
    const scImports = import.meta.glob('./configs/*/scenarios/*.json', { as: 'json' });

    const loadConfig = async () => {
      try {
        setLoading(true);
        // Load app.json via Vite glob
        const appPath = `./configs/${slug}/app.json`;
        const appLoader = appImports[appPath] as (() => Promise<any>);
        if (!appLoader) throw new Error(`Brak pliku konfiguracji: ${appPath}`);
        const appJson = await appLoader();

        // Load workspaces
        const workspaces: WorkspaceConfig[] = [];
        for (const wsRef of appJson.workspaces) {
          const refPath = wsRef.$ref.replace(/^\.\//, '');
          const wsPath = `./configs/${slug}/${refPath}`;
          const wsLoader = wsImports[wsPath] as (() => Promise<any>);
          if (!wsLoader) throw new Error(`Brak workspace: ${wsPath}`);
          const wsJson = await wsLoader();
          workspaces.push(wsJson as WorkspaceConfig);
        }

        // Load scenarios
        const scenarios: ScenarioConfig[] = [];
        for (const scRef of appJson.scenarios) {
          const refPath = scRef.$ref.replace(/^\.\//, '');
          const scPath = `./configs/${slug}/${refPath}`;
          const scLoader = scImports[scPath] as (() => Promise<any>);
          if (!scLoader) throw new Error(`Brak scenariusza: ${scPath}`);
          const scJson = await scLoader();
          const sc = scJson as ScenarioConfig;
          scenarios.push({ slug: sc.slug, workspaceSlug: sc.workspaceSlug, ...sc });
        }

        const appConfig: AppConfig = {
          name: appJson.name,
          description: appJson.description,
          tplDir: appJson.tplDir,
          workspaces,
          scenarios,
        };

        setConfig(appConfig);
        setConfigType('local');
        setError(null);
      } catch (err: any) {
        console.error('Błąd ładowania konfiguracji', err);
        setError('Nie udało się załadować konfiguracji');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, configType, configId, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
