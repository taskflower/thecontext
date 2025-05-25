/// src/hooks.ts
import { useState, useEffect } from "react";
import { loadConfig } from "./config";
import type { Record } from "./db";
import { configDB } from "./db";
import Dexie from "dexie";

export function useConfig<T>(configName: string, path: string) {
  const [data, setData] = useState<T>();
  useEffect(() => {
    loadConfig(configName, path).then(setData).catch(console.error);
  }, [configName, path]);
  return data;
}

export function useLocalStore<T>() {
  const [items, setItems] = useState<T[]>([]);
  const table = configDB.table as Dexie.Table<Record<T>, string>;
  useEffect(() => {
    table.toArray().then(arr => setItems(arr.map(r => r.data)));
  }, []);
  const add = (d: T) => table.put({ id: Date.now().toString(), data: d, updatedAt: new Date() });
  return { items, add };
}
