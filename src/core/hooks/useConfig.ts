// src/core/hooks/useConfig.ts - FIXED infinite rerenders and empty path bug
import { useState, useEffect, useRef, useCallback } from "react";
import { db } from '@/provideDB/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { configDB } from "@/provideDB";

// Global cache and tracking
const configCache = new Map<string, any>();
const firebaseChecked = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>(); // 🛡️ Prevent duplicate requests

interface ConfigEntry {
  id: string;
  data: any;
  version: number;
  updatedAt: Date;
}

export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();
  const mountedRef = useRef(true);
  
  const key = `${configName}:${path}`;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // 🛡️ FIX: Stable loadConfig function with proper dependencies
  const loadConfig = useCallback(async () => {
    if (!mountedRef.current || !configName || !path) return;

    // 🛡️ Prevent duplicate requests for same key
    if (loadingPromises.has(key)) {
      await loadingPromises.get(key);
      return;
    }

    // 🚀 Check cache first
    if (configCache.has(key)) {
      setData(configCache.get(key));
      return;
    }

    const loadPromise = (async () => {
      try {
        // 🚀 PRIORITY 1: IndexedDB (instant)
        const localConfig = await loadFromIndexedDB();
        if (localConfig && mountedRef.current) {
          setData(localConfig.data);
          configCache.set(key, localConfig.data);
        }

        // 🔄 PRIORITY 2: Firebase (background check)
        if (!firebaseChecked.has(configName)) {
          firebaseChecked.add(configName);
          const firebaseConfig = await loadFromFirebase();
          
          if (firebaseConfig && mountedRef.current) {
            const localVersion = localConfig?.version || 0;
            
            if (firebaseConfig.version > localVersion) {
              console.log(`🔄 Updating "${configName}" v${localVersion} → v${firebaseConfig.version}`);
              
              await configDB.records.put({
                id: key,
                data: firebaseConfig.data,
                version: firebaseConfig.version,
                updatedAt: firebaseConfig.updatedAt
              });
              
              setData(firebaseConfig.data);
              configCache.set(key, firebaseConfig.data);
            }
          }
        }

        // 📁 PRIORITY 3: JSON files (last resort)
        if (!localConfig && !firebaseChecked.has(`${configName}:fallback:${key}`)) {
          firebaseChecked.add(`${configName}:fallback:${key}`);
          console.log(`📁 Fallback: Trying to load from files for "${key}"`);
          
          const fileConfig = await loadFromFiles();
          
          if (fileConfig && mountedRef.current && !configCache.has(key)) {
            console.log(`✅ Using file config for "${key}"`);
            setData(fileConfig);
            configCache.set(key, fileConfig);
            
            await configDB.records.put({
              id: key,
              data: fileConfig,
              version: 1,
              updatedAt: new Date()
            });
          } else if (!fileConfig) {
            console.error(`❌ No config found for "${key}" in any source`);
          }
        }
      } finally {
        loadingPromises.delete(key);
      }
    })();

    loadingPromises.set(key, loadPromise);
    await loadPromise;

    // 🗄️ Load from IndexedDB
    async function loadFromIndexedDB(): Promise<ConfigEntry | null> {
      try {
        const record = await configDB.records.get(key);
        if (record?.data) {
          console.log(`📦 Loaded "${key}" from IndexedDB`);
          return {
            id: key,
            data: record.data,
            version: (record as any).version || 1,
            updatedAt: record.updatedAt
          };
        }
      } catch (err) {
        console.warn('IndexedDB error:', err);
      }
      return null;
    }

    // ☁️ Load from Firebase
    async function loadFromFirebase(): Promise<ConfigEntry | null> {
      try {
        const configsRef = collection(db, 'configs');
        const q = query(configsRef, where('name', '==', configName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const configDoc = querySnapshot.docs[0];
          const configData = configDoc.data();
          
          console.log(`☁️ Checking Firebase for "${configName}" v${configData.version || 1}`);
          
          if (configData.entries) {
            for (const entry of configData.entries) {
              await configDB.records.put({
                id: entry.id,
                data: entry.data,
                version: entry.version || configData.version || 1,
                updatedAt: new Date(entry.updatedAt)
              });
            }
          }
          
          const entry = configData.entries?.find((e: any) => e.id === key);
          if (entry) {
            return {
              id: key,
              data: entry.data,
              version: entry.version || configData.version || 1,
              updatedAt: new Date(entry.updatedAt)
            };
          }
        }
      } catch (err) {
        console.warn(`Firebase error for "${configName}":`, err);
      }
      return null;
    }

    // 📁 Load from JSON files
    async function loadFromFiles(): Promise<T | null> {
      try {
        console.log(`📁 Attempting to fetch: ${path}`);
        
        // 🛡️ FIX: Check for empty path
        if (!path || path.trim() === '') {
          console.warn(`📁 Empty path provided for "${configName}"`);
          return null;
        }
        
        const res = await fetch(path);
        
        if (!res.ok) {
          console.warn(`📁 Config file not found [${res.status}]: ${path}`);
          return null;
        }
        
        const cfg = await res.json() as T;
        console.log(`✅ Loaded "${key}" from files successfully`);
        return cfg;
      } catch (err) {
        console.error(`❌ File fetch error for ${path}:`, err);
        return null;
      }
    }
  }, [configName, path, key]); // 🛡️ FIX: Stable dependencies

  // 🛡️ FIX: Only run when configName and path are valid
  useEffect(() => {
    if (configName && path) {
      loadConfig();
    }
  }, [loadConfig]);

  return data;
}