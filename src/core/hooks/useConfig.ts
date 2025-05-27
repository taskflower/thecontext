// src/core/hooks/useConfig.ts - TYLKO konfiguracja
import { useState, useEffect } from "react";
import { configDB } from '@/db';

const configCache = new Map<string, any>(); // Cache TYLKO dla konfigów

export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    let mounted = true;
    const key = `${configName}:${path}`;

    const load = async () => {
      // Check cache
      if (configCache.has(key)) {
        mounted && setData(configCache.get(key));
        return;
      }

      // Check IndexedDB  
      const rec = await configDB.records.get(key);
      if (rec?.data) {
        configCache.set(key, rec.data);
        mounted && setData(rec.data);
        return;
      }

      // Fetch from network
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
      const cfg = await res.json();

      // Cache and save
      configCache.set(key, cfg);
      await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
      mounted && setData(cfg);
    };

    load().catch(console.error);
    return () => { mounted = false; };
  }, [configName, path]);

  return data;
}