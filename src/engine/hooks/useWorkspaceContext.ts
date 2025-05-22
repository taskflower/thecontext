// src/engine/hooks/useWorkspaceContext.ts
import { useState, useEffect, useCallback } from "react";
import { useAppNavigation } from "./useAppNavigation";

interface ContextSchema {
  [key: string]: {
    type: string;
    properties: Record<string, any>;
  };
}

export const useWorkspaceContext = () => {
  const { config, workspace } = useAppNavigation();
  const [contextSchema, setContextSchema] = useState<ContextSchema>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!config || !workspace) return;

    setLoading(true);
    import(`/src/configs/${config}/workspaces/${workspace}.json`)
      .then((module) => {
        setContextSchema(module.default.contextSchema || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [config, workspace]);

  const getSchema = useCallback((path: string) => {
    return contextSchema[path];
  }, [contextSchema]);

  return { getSchema, loading };
};