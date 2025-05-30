// src/core/hooks/useConfig.ts - SIMPLIFIED VERSION
import { useState, useEffect } from "react";
import { configDB } from '@/db';
import { db } from '@/provideDB/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const configCache = new Map<string, any>();

/**
 * Ładuje konfigurację - uproszczona wersja
 * Kolejność: memory cache → IndexedDB → Firestore → fetch JSON
 */
export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();
  
  // Prosty klucz - bez skomplikowanych identyfikatorów
  const key = `${configName}:${path}`;

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      // 1. Memory cache
      if (configCache.has(key)) {
        if (mounted) setData(configCache.get(key));
        return;
      }

      // 2. IndexedDB cache
      try {
        const rec = await configDB.records.get(key);
        if (rec?.data) {
          configCache.set(key, rec.data);
          if (mounted) setData(rec.data);
          return;
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
            if (entry && mounted) {
              setData(entry.data);
              return;
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
          return;
        }
        
        const cfg = await res.json() as T;
        configCache.set(key, cfg);
        await configDB.records.put({ 
          id: key, 
          data: cfg, 
          updatedAt: new Date() 
        });
        
        if (mounted) setData(cfg);
      } catch (err) {
        console.warn('Fetch error:', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, [configName, path, key]);

  return data;
}