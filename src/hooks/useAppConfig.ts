// src/hooks/useAppConfig.ts
import { useState, useEffect } from 'react';
import { AppConfig } from '@/core/types';
import { configLoader } from '@/SimpleFirebaseConfig';

interface UseAppConfigResult {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  configType: 'local' | 'firebase' | null;
  configId: string | null;
}

export function useAppConfig(): UseAppConfigResult {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configType, setConfigType] = useState<'local' | 'firebase' | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Sprawdź configId w URL
        const match = window.location.pathname.match(/^\/app\/([^\/]+)/);
        const configIdFromUrl = match?.[1] || null;
        
        let loadedConfig: AppConfig;
        
        if (configIdFromUrl) {
          // Próbuj załadować określoną konfigurację
          loadedConfig = await configLoader.loadConfig(configIdFromUrl);
          if (!canceled) {
            setConfigId(configIdFromUrl);
            setConfigType(configLoader.isLocalConfig(configIdFromUrl) ? 'local' : 'firebase');
          }
        } else {
          // Brak configId, załaduj domyślną konfigurację
          loadedConfig = await configLoader.loadDefaultConfig();
          if (!canceled) {
            const defaultId = (loadedConfig as any)._source?.configId || 'default';
            setConfigId(defaultId);
            setConfigType('local');
          }
        }

        if (!canceled) {
          setConfig(loadedConfig);
        }
      } catch (err: any) {
        if (!canceled) {
          setError(err.message || 'Błąd przy ładowaniu konfiguracji');
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { canceled = true; };
  }, []);

  return { config, loading, error, configType, configId };
}