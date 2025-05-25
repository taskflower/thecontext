// src/core/hooks/useWorkspaceSchema.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "./useConfig";

export function useWorkspaceSchema(schemaPath: string) {
  const { config = "exampleTicketApp", workspace = "" } = useParams<{
    config: string;
    workspace: string;
  }>();
  const workspaceConfig = useConfig(
    config,
    `/src/_configs/${config}/workspaces/${workspace}.json`
  );

  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    if (!workspaceConfig || !schemaPath) return;
    const s = workspaceConfig.contextSchema?.[schemaPath];
    setSchema(s ?? null);
  }, [workspaceConfig, schemaPath]);

  return {
    schema,
    loading: !workspaceConfig,
    error: !workspaceConfig
      ? null
      : schema
      ? null
      : `Nie znaleziono schemy ${schemaPath}`,
  };
}
