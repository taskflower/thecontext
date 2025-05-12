// src/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppConfig, WorkspaceConfig, ScenarioConfig } from './core/types';

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

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configType, setConfigType] = useState<'local' | 'firebase' | 'documentdb' | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get('config') || 'energyGrantApp').trim();
    // const slug = (params.get('config') || 'marketingApp').trim();
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

        // Load workspaces - w trybie dokumentowej bazy danych zamiast $ref używamy id
        const workspaces: WorkspaceConfig[] = [];
        for (const wsRef of appJson.workspaces) {
          const workspaceId = wsRef.id;
          const wsPath = `./configs/${slug}/workspaces/${workspaceId}.json`;
          const wsLoader = wsImports[wsPath] as (() => Promise<any>);
          if (!wsLoader) throw new Error(`Brak workspace: ${wsPath}`);
          const wsJson = await wsLoader();
          workspaces.push(wsJson as WorkspaceConfig);
        }

        // Load scenarios - w trybie dokumentowej bazy danych zamiast $ref używamy id
        const scenarios: ScenarioConfig[] = [];
        for (const scRef of appJson.scenarios) {
          const scenarioId = scRef.id;
          const scPath = `./configs/${slug}/scenarios/${scenarioId}.json`;
          const scLoader = scImports[scPath] as (() => Promise<any>);
          if (!scLoader) throw new Error(`Brak scenariusza: ${scPath}`);
          const scJson = await scLoader();
          scenarios.push(scJson as ScenarioConfig);
        }

        const appConfig: AppConfig = {
          name: appJson.name,
          description: appJson.description,
          tplDir: appJson.tplDir,
          workspaces,
          scenarios,
        };

        setConfig(appConfig);
        setConfigType('documentdb');
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