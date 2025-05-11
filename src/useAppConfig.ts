// src/hooks/useAppConfig.ts
import { useState, useEffect } from 'react';
import { AppConfig } from '@/core/types';
import { simpleConfigLoader } from '@/SimpleFirebaseConfig';

interface UseAppConfigResult {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  usingFirebase: boolean;
}

export function useAppConfig(): UseAppConfigResult {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFirebase, setUsingFirebase] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // 1. Sprawdź appId w URL
      const match = window.location.pathname.match(/^\/app\/([^\/]+)/);
      const appIdFromUrl = match?.[1] || null;
      // 2. Albo ostatnie używane w localStorage
      const stored = !appIdFromUrl ? localStorage.getItem('lastFirebaseAppId') : null;
      const appId = appIdFromUrl || stored;

      try {
        if (appId) {
          // Fetch z Firebase
          const fbConfig = await simpleConfigLoader.loadFirebaseConfigWithId(appId);
          if (!canceled) {
            setConfig(fbConfig);
            console.log('[useAppConfig] (Firebase) workspaces:', fbConfig.workspaces);
            setUsingFirebase(true);
            if (appIdFromUrl) localStorage.setItem('lastFirebaseAppId', appIdFromUrl);
          }
        } else {
          // Fetch lokalny
          const localConfig = await simpleConfigLoader.loadLocalConfig();
          if (!canceled) {
            setConfig(localConfig);
            console.log('[useAppConfig] (Local) workspaces:', localConfig.workspaces);
            setUsingFirebase(false);
          }
        }
      } catch (err: any) {
        if (!canceled) setError(err.message || 'Błąd przy ładowaniu konfiguracji');
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => { canceled = true; };
  }, []);

  return { config, loading, error, usingFirebase };
}
