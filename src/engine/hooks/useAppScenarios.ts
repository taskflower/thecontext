// engine/hooks/useAppScenarios.ts
import { useState, useEffect } from "react";

// Global cache - survives re-renders
const scenariosCache: Record<string, { scenarios: string[], loaded: boolean }> = {};

export const useAppScenarios = (config?: string, workspace?: string) => {
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!config || !workspace) {
      setScenarios([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${config}/${workspace}`;
    
    // Return cached immediately
    if (scenariosCache[cacheKey]?.loaded) {
      setScenarios(scenariosCache[cacheKey].scenarios);
      setIsLoading(false);
      return;
    }

    // Initialize cache entry
    if (!scenariosCache[cacheKey]) {
      scenariosCache[cacheKey] = { scenarios: [], loaded: false };
    }

    // Already loading
    if (scenariosCache[cacheKey].loaded === false && scenariosCache[cacheKey].scenarios.length > 0) {
      setScenarios(scenariosCache[cacheKey].scenarios);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const scenarioModules = import.meta.glob('/src/configs/*/scenarios/*/*.json');
    const pattern = `/src/configs/${config}/scenarios/${workspace}/`;
    const allPaths = Object.keys(scenarioModules);
    const filteredPaths = allPaths.filter(path => path.startsWith(pattern));
    const scenarioFiles = filteredPaths.map(path => path.replace(pattern, '').replace('.json', ''));

    // Cache globally
    scenariosCache[cacheKey] = { scenarios: scenarioFiles, loaded: true };
    setScenarios(scenarioFiles);
    setIsLoading(false);
  }, [config, workspace]);

  return { scenarios, loading: isLoading };
};