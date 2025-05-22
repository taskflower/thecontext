// engine/hooks/useAppScenarios.ts
import { useState, useEffect } from "react";

const cache: Record<string, string[]> = {};

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
    if (cache[cacheKey]) {
      setScenarios(cache[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const scenarioModules = import.meta.glob('/src/configs/*/scenarios/*/*.json');
    
    const pattern = `/src/configs/${config}/scenarios/${workspace}/`;
    const allPaths = Object.keys(scenarioModules);
    const filteredPaths = allPaths.filter(path => path.startsWith(pattern));
    const scenarioFiles = filteredPaths.map(path => path.replace(pattern, '').replace('.json', ''));

    console.log('🔍 Scenarios Debug:', {
      config,
      workspace,
      pattern,
      allPaths,
      filteredPaths,
    scenarioFiles
    });

    cache[cacheKey] = scenarioFiles;
    setScenarios(scenarioFiles);
    setIsLoading(false);
  }, [config, workspace]);

  return { scenarios, loading: isLoading };
};