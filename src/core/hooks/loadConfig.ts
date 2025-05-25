// src/core/hooks/loadConfig.ts

import { configDB } from '@/db';
import { useEngineStore } from './useEngineStore';

export async function loadConfig(configName: string, path: string): Promise<any> {
  const key = `${configName}:${path}`;

  // 1) spróbuj z IndexedDB
  const rec = await configDB.records.get(key);
  if (rec?.data) {
    useEngineStore.getState().addRecord(key, rec.data);
    return rec.data;
  }

  // 2) fetch
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
  const cfg = await res.json();

  // 3) zapis
  await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
  useEngineStore.getState().addRecord(key, cfg);

  return cfg;
}