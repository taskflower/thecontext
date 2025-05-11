// src/hooks/useAppConfig.ts
import { useState, useEffect } from 'react';
import { AppConfig } from '@/core/types';
import { simpleConfigLoader } from '@/SimpleFirebaseConfig';

/**
 * Hook ładujący konfigurację aplikacji wyłącznie lokalnie,
 * bez próby pobierania z Firebase.
 */
export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Załaduj wyłącznie lokalną konfigurację
        const localConfig = await simpleConfigLoader.loadLocalConfig();
        if (!canceled) {
          setConfig(localConfig);
        }
      } catch (err: any) {
        if (!canceled) {
          console.error('Błąd wczytywania lokalnej konfiguracji:', err);
          setError(err.message || 'Nie udało się wczytać konfiguracji lokalnej');
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

  return { config, loading, error, usingFirebase: false };
}
