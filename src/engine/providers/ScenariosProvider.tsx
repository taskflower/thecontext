// engine/providers/ScenariosProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface ScenariosContextType {
  scenarios: string[];
  loading: boolean;
}

const ScenariosContext = createContext<ScenariosContextType>({
  scenarios: [],
  loading: true,
});

export const useScenarios = () => useContext(ScenariosContext);

const cache: Record<string, string[]> = {};

export const ScenariosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, workspace } = useAppNavigation();
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config || !workspace) {
      setScenarios([]);
      setLoading(false);
      return;
    }

    const cacheKey = `${config}/${workspace}`;
    if (cache[cacheKey]) {
      setScenarios(cache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const scenarioModules = import.meta.glob('/src/configs/*/scenarios/*/*.json');
    const pattern = `/src/configs/${config}/scenarios/${workspace}/`;
    const allPaths = Object.keys(scenarioModules);
    const filteredPaths = allPaths.filter(path => path.startsWith(pattern));
    const scenarioFiles = filteredPaths.map(path => path.replace(pattern, '').replace('.json', ''));

    cache[cacheKey] = scenarioFiles;
    setScenarios(scenarioFiles);
    setLoading(false);
  }, [config, workspace]);

  return (
    <ScenariosContext.Provider value={{ scenarios, loading }}>
      {children}
    </ScenariosContext.Provider>
  );
};

