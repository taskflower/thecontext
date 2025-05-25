// src/ngn2/hooks/index.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getStoreManager } from "../store/StoreManager";
import { configManager } from "../config/ConfigManager";

// =============================================================================
// STORE HOOK
// =============================================================================

export function useStore<T = any>(collection: string) {
  const manager = useMemo(() => getStoreManager<T>(collection), [collection]);
  const [, forceUpdate] = useState({});

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    const unsubscribe = manager.subscribe(triggerUpdate);
    manager.initialize();
    return unsubscribe;
  }, [manager, triggerUpdate]);

  const state = manager.getState();

  return {
    // Reactive state
    data: manager.getAll(),
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // Actions
    get: useCallback((id: string) => manager.get(id), [manager]),
    getAll: useCallback(() => manager.getAll(), [manager]),
    set: useCallback(
      (id: string, data: Partial<T>) => manager.set(id, data),
      [manager]
    ),
    add: useCallback((data: Partial<T>) => manager.add(data), [manager]),
    delete: useCallback((id: string) => manager.delete(id), [manager]),
    refresh: useCallback(() => manager.refresh(), [manager]),
  };
}

// =============================================================================
// CONFIG HOOKS
// =============================================================================

export function useConfig(path: string) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        setLoading(true);
        setError(null);

        const data = await configManager.loadConfig(path);

        if (mounted) {
          setConfig(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load config"
          );
          setConfig(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      mounted = false;
    };
  }, [path]);

  const saveConfig = useCallback(
    async (newConfig: any) => {
      try {
        await configManager.saveConfig(path, newConfig);
        setConfig(newConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save config");
        throw err;
      }
    },
    [path]
  );

  return {
    config,
    loading,
    error,
    saveConfig,
    refresh: () => {
      configManager.clearCache(path);
      // Trigger reload by changing path dependency
      setLoading(true);
    },
  };
}

export function useSchema() {
  const { config, workspace } = useParams();
  const { config: workspaceConfig, loading } = useConfig(
    `/src/!CONFIGS/${config}/workspaces/${workspace}.json`
  );

  const getSchema = useCallback(
    (path: string) => {
      if (!workspaceConfig?.contextSchema) return null;
      return path
        .split(".")
        .reduce((obj, key) => obj?.[key], workspaceConfig.contextSchema);
    },
    [workspaceConfig]
  );

  return {
    getSchema,
    loading,
    contextSchema: workspaceConfig?.contextSchema,
  };
}

// =============================================================================
// EXPERIMENT HOOKS
// =============================================================================

export function useExperiments() {
  const store = useStore("experiments");

  const createExperiment = useCallback(
    async (experiment: any) => {
      const created = await store.add({
        ...experiment,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      return created;
    },
    [store]
  );

  const updateExperiment = useCallback(
    async (id: string, updates: any) => {
      const existing = store.get(id);
      if (!existing) throw new Error("Experiment not found");

      await store.set(id, {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [store]
  );

  const runExperiment = useCallback(
    async (id: string, runner: () => Promise<any>) => {
      await updateExperiment(id, { status: "running" });

      try {
        const result = await runner();
        await updateExperiment(id, {
          status: "completed",
          result,
          completedAt: new Date().toISOString(),
        });
        return result;
      } catch (error) {
        await updateExperiment(id, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    [updateExperiment]
  );

  return {
    experiments: store.data,
    loading: store.loading,
    error: store.error,
    createExperiment,
    updateExperiment,
    runExperiment,
    deleteExperiment: store.delete,
    refresh: store.refresh,
  };
}

// =============================================================================
// LLM HOOK (CLEANED UP)
// =============================================================================

export function useLlm<T>({
  schema,
  userMessage,
  systemMessage,
  collection = "context",
}: {
  schema?: any;
  userMessage: string;
  systemMessage?: string;
  collection?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const store = useStore(collection);
  const params = useParams();

  const processTemplate = useCallback(
    (str: string) => {
      return str.replace(/{{([^}]+)}}/g, (_, path) => {
        const trimmed = path.trim();

        // Check params first
        if (params[trimmed]) return String(params[trimmed]);

        // Then check store data
        const storeData = store.getAll();
        for (const item of storeData) {
          const keys = trimmed.split(".");
          let current = item;
          for (const key of keys) {
            current = current?.[key];
            if (current === undefined) break;
          }
          if (current !== undefined) return String(current);
        }

        return "";
      });
    },
    [store, params]
  );

  const processedMessage = useMemo(
    () => processTemplate(userMessage),
    [processTemplate, userMessage]
  );

  const start = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const messages = [];

      if (schema) {
        messages.push({
          role: "system",
          content: `Return JSON matching this schema: ${JSON.stringify(
            schema
          )}`,
        });
      }

      if (systemMessage) {
        messages.push({
          role: "system",
          content: processTemplate(systemMessage),
        });
      }

      messages.push({ role: "user", content: processedMessage });

      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`LLM API failed: ${response.status}`);
      }

      const { result: llmResult } = await response.json();
      setResult(llmResult);

      return llmResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [processedMessage, processTemplate, systemMessage, schema, isLoading]);

  return {
    isLoading,
    error,
    result,
    processedMessage,
    start,
    reset: () => {
      setResult(null);
      setError(null);
    },
  };
}
