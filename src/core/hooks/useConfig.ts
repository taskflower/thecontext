// src/core/hooks/useConfig.ts - FIXED VERSION to prevent rerenders
import { useState, useEffect, useRef } from "react";
import { db } from '@/provideDB/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { configDB } from "@/provideDB";

// ✅ FIX: Move cache outside component to prevent reinitialization
const configCache = new Map<string, any>();
const loadingPromises = new Map<string, Promise<any>>();

/**
 * Ładuje konfigurację - stabilna wersja bez nieskończonych rerenderów
 */
export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();
  const mountedRef = useRef(true);
  
  // ✅ FIX: Stable key generation
  const key = `${configName}:${path}`;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // ✅ FIX: Prevent duplicate requests
    if (loadingPromises.has(key)) {
      loadingPromises.get(key)?.then((result) => {
        if (mountedRef.current && result) {
          setData(result);
        }
      });
      return;
    }

    // ✅ FIX: Return early if already cached
    if (configCache.has(key)) {
      if (mountedRef.current) {
        setData(configCache.get(key));
      }
      return;
    }

    const loadPromise = (async () => {
      try {
        // 1. Memory cache (already checked above)
        
        // 2. IndexedDB cache
        try {
          const rec = await configDB.records.get(key);
          if (rec?.data) {
            configCache.set(key, rec.data);
            return rec.data;
          }
        } catch (err) {
          console.warn('IndexedDB error:', err);
        }

        // 3. Firestore (jeśli dostępne)
        try {
          const configsRef = collection(db, 'configs');
          const q = query(configsRef, where('name', '==', configName));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const configDoc = querySnapshot.docs[0];
            const configData = configDoc.data();
            
            if (configData.entries) {
              // Synchronizuj lokalnie
              for (const e of configData.entries) {
                await configDB.records.put({
                  id: e.id,
                  data: e.data,
                  updatedAt: new Date(e.updatedAt)
                });
                configCache.set(e.id, e.data);
              }
              
              // Znajdź aktualny entry
              const entry = configData.entries.find((e: any) => e.id === key);
              if (entry) {
                return entry.data;
              }
            }
          }
        } catch (err) {
          console.warn('Firestore error:', err);
        }

        // 4. Fetch JSON file
        try {
          const res = await fetch(path);
          
          if (!res.ok) {
            if (res.status === 404) {
              console.info(`Config file not found: ${path}`);
            }
            return null;
          }
          
          const cfg = await res.json() as T;
          configCache.set(key, cfg);
          
          // Save to IndexedDB
          try {
            await configDB.records.put({ 
              id: key, 
              data: cfg, 
              updatedAt: new Date() 
            });
          } catch (err) {
            console.warn('Failed to cache config in IndexedDB:', err);
          }
          
          return cfg;
        } catch (err) {
          console.warn('Fetch error:', err);
          return null;
        }
      } finally {
        // ✅ FIX: Clean up loading promise
        loadingPromises.delete(key);
      }
    })();

    // ✅ FIX: Store loading promise
    loadingPromises.set(key, loadPromise);

    loadPromise.then((result) => {
      if (mountedRef.current && result) {
        setData(result);
      }
    });

  }, [configName, path, key]); // ✅ FIX: Stable dependencies

  return data;
}