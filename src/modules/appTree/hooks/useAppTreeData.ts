// src/modules/appTree/hooks/useAppTreeData.ts
import { useState, useEffect } from 'react';
import { AppConfig, useConfig } from "@/core";
import { CacheManager } from '../services/cacheManager';
import { WorkspaceInfo } from './useAppTree';

export const useAppTreeData = (configName: string) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appConfig = useConfig<AppConfig>(
    configName,
    `/src/_configs/${configName}/app.json`
  );

  useEffect(() => {
    if (!appConfig) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cacheManager = new CacheManager(configName);
        
        // Sync cache with config first
        await cacheManager.syncCacheWithConfig(appConfig);
        
        // Load data from cache
        const workspacesData = await cacheManager.loadWorkspacesFromCache();
        
        // Sort scenarios within workspaces
        workspacesData.forEach(ws => {
          ws.scenarios.sort((a, b) => {
            const order = ["login", "profile", "list", "create", "edit", "view", "delete", "llm-create"];
            const ai = order.indexOf(a.slug);
            const bi = order.indexOf(b.slug);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return a.slug.localeCompare(b.slug);
          });
        });

        // Sort workspaces
        if (appConfig.workspaces) {
          workspacesData.sort((a, b) =>
            appConfig.workspaces!.indexOf(a.slug) - appConfig.workspaces!.indexOf(b.slug)
          );
        } else {
          workspacesData.sort((a, b) => a.slug.localeCompare(b.slug));
        }

        setWorkspaces(workspacesData);
      } catch (e) {
        console.error(e);
        setError("Błąd przy ładowaniu danych z cache");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [appConfig, configName]);

  return { workspaces, loading, error, appConfig };
};
