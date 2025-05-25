import { configDB } from "./db";

/// src/config.ts
export async function loadConfig(configName: string, path: string) {
  const key = `${configName}:${path}`;
  const rec = await configDB.records.get(key);
  if (rec) return rec.data;
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.statusText);
  const cfg = await res.json();
  await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
  return cfg;
}
