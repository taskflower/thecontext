// src/core/hooks/useConfig.ts
import { useState, useEffect } from "react";
import { loadConfig } from "./loadConfig";

export interface WorkspaceConfig {
  contextSchema?: Record<string, any>;
}

export function useConfig<T>(configName: string, path: string): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    let mounted = true;
    loadConfig(configName, path)
      .then((cfg) => mounted && setData(cfg))
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, [configName, path]);

  return data;
}
