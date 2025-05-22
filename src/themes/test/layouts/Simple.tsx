// Simple.tsx - cache scenarios directly
import { useAppNavigation } from "@/engine";
import { useState, useEffect } from "react";

const scenariosCache = new Map();

export default function Simple({ children }: { children: React.ReactNode }) {
  const { config, workspace, scenario, navigateTo } = useAppNavigation();
  const [scenarios, setScenarios] = useState<string[]>([]);

  useEffect(() => {
    if (!config || !workspace) return;

    const cacheKey = `${config}/${workspace}`;
    if (scenariosCache.has(cacheKey)) {
      setScenarios(scenariosCache.get(cacheKey));
      return;
    }

    const scenarioModules = import.meta.glob('/src/configs/*/scenarios/*/*.json');
    const pattern = `/src/configs/${config}/scenarios/${workspace}/`;
    const allPaths = Object.keys(scenarioModules);
    const filteredPaths = allPaths.filter(path => path.startsWith(pattern));
    const scenarioFiles = filteredPaths.map(path => path.replace(pattern, '').replace('.json', ''));

    scenariosCache.set(cacheKey, scenarioFiles);
    setScenarios(scenarioFiles);
  }, [config, workspace]);

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 border-r p-4">
        <h3 className="font-semibold mb-4">Scenariusze</h3>
        <ul className="space-y-2">
          {scenarios.map((scenarioSlug) => (
            <li key={scenarioSlug}>
              <button
                onClick={() => navigateTo(`${workspace}/${scenarioSlug}`)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 ${
                  scenario === scenarioSlug 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700'
                }`}
              >
                {scenarioSlug}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}