// src/core/hooks/useWorkspaceSchema.ts - Optimized (-50% size)
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "./useConfig";
import type { WorkspaceConfig, SchemaHookResult } from "../types";

export function useWorkspaceSchema(schemaPath: string): SchemaHookResult {
  const { config = "exampleTicketApp", workspace = "" } = useParams<{
    config: string;
    workspace: string;
  }>();

  const workspaceConfig = useConfig<WorkspaceConfig>(
    config,
    `/src/_configs/${config}/workspaces/${workspace}.json`
  );

  const result = useMemo(() => {
    if (!workspaceConfig) return { schema: null, loading: true, error: null };
    
    const schema = workspaceConfig.contextSchema?.[schemaPath];
    return {
      schema: schema ?? null,
      loading: false,
      error: schema ? null : `Nie znaleziono schemy ${schemaPath}`,
    };
  }, [workspaceConfig, schemaPath]);

  return result;
}