// layouts/Simple.tsx

import { useAppNavigation } from "@/engine";
import { useAppScenarios } from "@/engine/hooks/useAppScenarios";


export default function Simple({ children }: { children: React.ReactNode }) {
  const { config, workspace, scenario, navigateTo } = useAppNavigation();
  const { scenarios, loading } = useAppScenarios(config, workspace);

  return (
    <div className="flex h-screen">
      {/* Sidebar z menu scenariuszy */}
      <div className="w-64 bg-gray-100 border-r p-4">
        <h3 className="font-semibold mb-4">Scenariusze</h3>
        
        {loading ? (
          <div className="text-gray-500">Ładowanie...</div>
        ) : (
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
        )}
      </div>

      {/* Główna zawartość */}
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
}