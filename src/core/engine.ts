// src/core/engine.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthContext } from "../auth/AuthContext";
import { ZodType } from "zod";
import {  useCallback, useMemo, useEffect } from "react";
import { configDB } from "../db";

// --- Flow & DB store ---
interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
  getAll: (prefix: string) => Promise<any[]>;
  addRecord: (id: string, data: any) => Promise<void>;
}

export const useEngineStore = create<FlowState>()(
  persist(
    (set, get) => ({
      data: {},
      get: (path) =>
        path.split(".").reduce((obj: any, key) => obj?.[key], get().data),
      set: (path, value) =>
        set((state) => {
          const keys = path.split(".");
          const last = keys.pop()!;
          const target = keys.reduce((obj: any, k) => {
            if (!obj[k]) obj[k] = {};
            return obj[k];
          }, state.data);
          target[last] = value;
          return { data: { ...state.data } };
        }),
      reset: () => set({ data: {} }),
      getAll: async (prefix) => {
        const recs = await configDB.records
          .where("id")
          .startsWith(prefix)
          .toArray();
        return recs.map((r) => r.data);
      },
      addRecord: async (id, data) => {
        await configDB.records.put({ id, data, updatedAt: new Date() });
      },
    }),
    { name: "engine-storage", partialize: (state) => ({ data: state.data }) }
  )
);

// --- Unified LLM hook ---
interface LlmOptions<T> {
  schema?: ZodType<T>;
  jsonSchema?: any;
  userMessage: string;
  systemMessage?: string;
  autoStart?: boolean;
  apiEndpoint?: string;
}

export function useLlmEngine<T>({
  schema,
  jsonSchema,
  userMessage,
  systemMessage,
  autoStart = false,
  apiEndpoint,
}: LlmOptions<T>) {
  const { get } = useEngineStore();
  const { user, getToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const processTemplate = (str: string) =>
    str.replace(/{{([^}]+)}}/g, (_, p) => String(get(p.trim()) ?? ""));

  const processedUser = useMemo(() => processTemplate(userMessage), [
    userMessage,
  ]);

  const start = useCallback(async () => {
    if (isLoading) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);
    try {
      const msgs: { role: string; content: string }[] = [];
      if (jsonSchema)
        msgs.push({
          role: "system",
          content: `Zwróć JSON zgodny ze schemą: ${JSON.stringify(
            jsonSchema
          )}`,
        });
      if (systemMessage)
        msgs.push({ role: "system", content: processTemplate(systemMessage) });
      msgs.push({ role: "user", content: processedUser });

      const token = await getToken();
      if (!token || !user)
        throw new Error(token ? "Użytkownik nie zalogowany" : "Brak tokenu");

      const res = await fetch(
        apiEndpoint ||
          `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: msgs,
            generationConfig: jsonSchema
              ? { responseSchema: jsonSchema, temperature: 0.7 }
              : { temperature: 0.7 },
            userId: user.uid,
          }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error?.message || "Błąd LLM");
      const { result: llmRes } = await res.json();
      if (schema) {
        const v = schema.safeParse(llmRes);
        if (!v.success) throw new Error("Nieprawidłowy format: " + v.error.message);
        setResult(v.data);
      } else setResult(llmRes as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [processedUser, systemMessage, jsonSchema, isLoading, getToken, user]);

  useEffect(() => {
    if (autoStart) start();
  }, []);

  return { isLoading, error, result, started, start, setStarted };
}

// --- Config loader + hook ---
/**
 * Ładuje konfigurację z IndexedDB lub sieci, zapisuje w DB i w silniku.
 */
export async function loadConfig(configName: string, path: string): Promise<any> {
  const key = `${configName}:${path}`;

  // 1) spróbuj z IndexedDB
  const rec = await configDB.records.get(key);
  if (rec?.data) {
    useEngineStore.getState().addRecord(key, rec.data);
    return rec.data;
  }

  // 2) fetch
  console.log(path);
  
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
  const cfg = await res.json();

  // 3) zapis
  await configDB.records.put({ id: key, data: cfg, updatedAt: new Date() });
  useEngineStore.getState().addRecord(key, cfg);

  return cfg;
}

import { useState } from "react";
/**
 * React-hook do pobrania konfiguracji (cache + fetch).
 */
export function useConfig<T>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    let mounted = true;
    loadConfig(configName, path)
      .then((cfg) => mounted && setData(cfg))
      .catch(console.error);
    return () => { mounted = false; };
  }, [configName, path]);

  return data;
}

// --- Wrapper hook useLocalStore ---
export function useLocalStore<T>(prefix: string) {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    useEngineStore.getState()
      .getAll(prefix)
      .then(setItems)
      .catch(console.error);
  }, [prefix]);

  const add = (data: T) => {
    const id = Date.now().toString();
    useEngineStore.getState().addRecord(`${prefix}${id}`, data);
  };

  return { items, add };
}
