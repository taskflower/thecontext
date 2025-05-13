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
    // Odczytaj configId z pierwszego segmentu URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const slug = pathSegments[0] || 'energyGrantApp';
    console.log(`[ConfigProvider] URL segments:`, pathSegments);
    console.log(`[ConfigProvider] Determined configId slug: ${slug}`);
    setConfigId(slug);

    // Import globs dla JSONów
    const appImports = import.meta.glob('./configs/*/app.json', { as: 'json' });
    const wsImports = import.meta.glob('./configs/*/workspaces/*.json', { as: 'json' });
    const scImports = import.meta.glob('./configs/*/scenarios/*.json', { as: 'json' });

    const loadConfig = async () => {
      try {
        setLoading(true);
        console.log('[ConfigProvider] Starting loadConfig');

        // Ładuj app.json
        const appPath = `./configs/${slug}/app.json`;
        console.log(`[ConfigProvider] Loading app JSON from: ${appPath}`);
        const appLoader = appImports[appPath] as (() => Promise<any>);
        if (!appLoader) throw new Error(`Brak pliku konfiguracji: ${appPath}`);
        const appData = await appLoader();
        console.log('[ConfigProvider] Loaded appData:', appData);

        // Load workspaces
        const workspaces: WorkspaceConfig[] = [];
        for (const wsRef of appData.workspaces) {
          const workspaceId = wsRef.id;
          const wsPath = `./configs/${slug}/workspaces/${workspaceId}.json`;
          console.log(`[ConfigProvider] Loading workspace JSON from: ${wsPath}`);
          const wsLoader = wsImports[wsPath] as (() => Promise<any>);
          if (!wsLoader) throw new Error(`Brak workspace: ${wsPath}`);
          const wsRaw = (await wsLoader()) as Omit<WorkspaceConfig, 'slug'>;
          console.log('[ConfigProvider] wsRaw:', wsRaw);
          console.log(`[ConfigProvider] Assigning workspace.slug = ${workspaceId}`);
          workspaces.push({ ...wsRaw, slug: workspaceId });
        }
        console.log('[ConfigProvider] Workspaces loaded:', workspaces.map(w => w.slug));

        // Load scenarios
        const scenarios: ScenarioConfig[] = [];
        for (const scRef of appData.scenarios) {
          const scenarioId = scRef.id;
          const scPath = `./configs/${slug}/scenarios/${scenarioId}.json`;
          console.log(`[ConfigProvider] Loading scenario JSON from: ${scPath}`);
          const scLoader = scImports[scPath] as (() => Promise<any>);
          if (!scLoader) throw new Error(`Brak scenariusza: ${scPath}`);
          const scRaw = (await scLoader()) as Omit<ScenarioConfig, 'slug'>;
          console.log('[ConfigProvider] scRaw:', scRaw);
          console.log(`[ConfigProvider] Assigning scenario.slug = ${scenarioId}`);
          scenarios.push({ ...scRaw, slug: scenarioId });
        }
        console.log('[ConfigProvider] Scenarios loaded:', scenarios.map(s => s.slug));

        // Zbuduj konfigurację
        const appConfig: AppConfig = {
          name: appData.name,
          description: appData.description,
          tplDir: appData.tplDir,
          workspaces,
          scenarios,
        };
        console.log('[ConfigProvider] Final appConfig:', appConfig);

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
