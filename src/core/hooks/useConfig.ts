// src/core/hooks/useConfig.ts
import { useState, useEffect } from "react";
import { configDB } from '@/db';
import { db } from '@/provideDB/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from "@/auth/AuthContext";

const configCache = new Map<string, any>();

export function useConfig<T = any>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();
  const { user } = useAuthContext();

  useEffect(() => {
    let mounted = true;
    const key = `${configName}:${path}`;

    const load = async () => {
      // 1) Jeśli mamy usera, najpierw sprawdź Firestore
      if (user) {
        const snap = await getDoc(doc(db, "userConfigs", user.uid, "configs", key));
        if (snap.exists()) {
          const { entries }: any = snap.data();
          // zsynchronizuj lokalnie
          await configDB.records.clear();
          for (const e of entries) {
            await configDB.records.put({ id: e.id, data: e.data, updatedAt: new Date(e.updatedAt) });
          }
        }
      }

      // 2) Cache
      if (configCache.has(key)) {
        mounted && setData(configCache.get(key));
        return;
      }

      // 3) IndexedDB
      const rec = await configDB.records.get(key);
      if (rec?.data) {
        configCache.set(key, rec.data);
        mounted && setData(rec.data);
        return;
      }

      // 4) Fetch z sieci
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
      const cfg = await res.json();
      configCache.set(key, cfg);
      await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
      mounted && setData(cfg);
    };

    load().catch(console.error);
    return () => { mounted = false; };
  }, [configName, path, user]);

  return data;
}
