// src/hooks/useAppConfig.ts
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppConfig } from '@/core/types';
import { simpleConfigLoader } from '@/config/SimpleFirebaseConfig';

/**
 * Hook ładujący konfigurację aplikacji: najpierw lokalnie, potem z Firebase.
 */
export function useAppConfig() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFirebase, setUsingFirebase] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Załaduj konfigurację lokalną
        const localConfig = await simpleConfigLoader.loadLocalConfig();
        if (canceled) return;

        // 2. Brak slug -> używamy lokalnej config
        if (!workspaceSlug) {
          setConfig(localConfig);
          setUsingFirebase(false);
        } else {
          // 3. Sprawdź workspace w lokalnej config
          const existsLocal = localConfig.workspaces.some(w => w.slug === workspaceSlug);
          if (existsLocal) {
            setConfig(localConfig);
            setUsingFirebase(false);
          } else {
            // 4. Pobierz config z Firebase
            const appId = (localConfig as any)._source?.appId || process.env.REACT_APP_FIREBASE_APP_ID!;
            const firebaseConfig = await simpleConfigLoader.loadFirebaseConfigWithId(appId);
            if (canceled) return;

            setConfig(firebaseConfig);
            setUsingFirebase(true);
          }
        }
      } catch (e: any) {
        console.error('Błąd loadowania config:', e);
        setError(e.message || 'Nie udało się wczytać konfiguracji');
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => { canceled = true; };
  }, [workspaceSlug]);

  return { config, loading, error, usingFirebase };
}