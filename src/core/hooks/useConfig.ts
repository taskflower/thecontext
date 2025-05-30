// src/core/hooks/useConfig.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { configDB } from '@/db';
import { db } from '@/provideDB/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
const configCache = new Map<string, any>();

/**
 * Ładuje konfigurację z lokalnej IndexedDB i Firestore (publiczny odczyt).
 * Kolejność: cache -> Firestore (szukanie po nazwie) -> fetch.
 */
export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();
  const params = useParams<{ workspace?: string; scenario?: string }>();

  // Identyfikator konfiguracji (nazwa bez uid)
  const cfgId = [configName, params.workspace, params.scenario]
    .filter(Boolean)
    .join('-') || 'default';
  
  // Unikalny klucz dla IndexedDB i cache
  const key = `${configName}:${path}`;

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      let localData: any;
      
      // Debug: pokaż co próbujemy załadować
      console.log(`useConfig: Loading ${configName} from ${path}`);
      console.log(`useConfig: Key = ${key}, ConfigId = ${cfgId}`);
      
      // 1. Lokalny cache w pamięci
      if (configCache.has(key)) {
        const cached = configCache.get(key);
        console.log(`useConfig: Found in memory cache for ${key}`);
        if (mounted) setData(cached);
        return;
      }

      // 2. Lokalny cache w IndexedDB
      try {
        const rec = await configDB.records.get(key);
        if (rec?.data) {
          localData = rec.data;
          configCache.set(key, localData);
          if (mounted) setData(localData);
        }
      } catch (err) {
        console.error('useConfig IndexedDB error', err);
      }

      // 3. Firestore - szukanie konfiguracji po nazwie (publiczny odczyt)
      try {
        // Próbujemy najpierw nową kolekcję configs
        const configsRef = collection(db, 'configs');
        const q = query(configsRef, where('name', '==', cfgId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Bierzemy pierwszą znalezioną konfigurację
          const configDoc = querySnapshot.docs[0];
          const configData = configDoc.data();
          
          if (configData.entries) {
            // Synchronizuj lokalnie wszystkie wpisy
            await configDB.records.clear();
            for (const e of configData.entries) {
              await configDB.records.put({
                id: e.id,
                data: e.data,
                updatedAt: new Date(e.updatedAt)
              });
            }
            
            // Weź tylko aktualny entry
            const entry = configData.entries.find((e: any) => e.id === key);
            if (entry) {
              const fresh = entry.data;
              configCache.set(key, fresh);
              if (mounted) setData(fresh);
              return;
            }
          }
        } else {
          // Fallback: szukaj w starych userConfigs (dla kompatybilności)
          console.log('Config not found in new collection, trying userConfigs...');
          // Tutaj można dodać logikę wyszukiwania w userConfigs jeśli potrzebne
        }
      } catch (err) {
        console.error('useConfig Firestore error', err);
        // Kontynuuj do fallback fetch
      }

      // 4. Jeśli istniały lokalne dane, zakończ
      if (localData !== undefined) return;

      // 5. Fallback – fetch pliku JSON
      try {
        console.log(`Fetching config from: ${path}`);
        const res = await fetch(path);
        
        if (!res.ok) {
          console.warn(`useConfig fetch failed: ${res.status} ${res.statusText} for ${path}`);
          // Jeśli plik nie istnieje, nie traktuj jako błąd - po prostu brak konfiguracji
          if (res.status === 404) {
            console.info(`Config file not found: ${path} - this is normal for new configurations`);
            return;
          }
          return;
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`useConfig: Expected JSON but got ${contentType} for ${path}`);
          // Sprawdź czy to nie jest HTML (błąd 404)
          const text = await res.text();
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            console.info(`Received HTML page instead of JSON for ${path} - file probably doesn't exist`);
            return;
          }
          // Spróbuj sparsować jako JSON mimo błędnego content-type
          try {
            const cfg = JSON.parse(text) as T;
            configCache.set(key, cfg);
            await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
            if (mounted) setData(cfg);
            return;
          } catch (parseErr) {
            console.error(`Failed to parse response as JSON for ${path}:`, parseErr);
            return;
          }
        }
        
        const cfg = (await res.json()) as T;
        configCache.set(key, cfg);
        await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
        if (mounted) setData(cfg);
      } catch (err) {
        console.warn('useConfig fetch error:', err);
        // Nie loguj jako error - brak pliku konfiguracyjnego to normalna sytuacja
      }
    };

    load();
    return () => { mounted = false; };
  }, [configName, path, cfgId]);

  return data;
}