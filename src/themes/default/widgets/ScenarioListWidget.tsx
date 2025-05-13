// src/themes/default/widgets/ScenarioListWidget.tsx
import { useMemo } from 'react';
import { Play, CheckCircle, Hourglass } from 'lucide-react';
import { AppConfig } from '@/core';
import { useAppNavigation } from '@/core/navigation';

type Scenario = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  workspaceSlug: string;
  status?: 'active' | 'completed' | 'pending';
};

type ScenarioListWidgetProps = {
  title?: string;
  config: AppConfig;
  workspaceSlug: string;
};

export default function ScenarioListWidget({
  title,
  config,
  workspaceSlug
}: ScenarioListWidgetProps) {
  const { toScenarioStep } = useAppNavigation();

  // Filtruj scenariusze dla tego workspace
  const scenarios: Scenario[] = useMemo(
    () => config.scenarios.filter(s => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <Hourglass className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const isActive = (status?: string) => status === 'active';

  return (
    <div className="p-4">
      {title && <h3 className="text-base font-semibold mb-3">{title}</h3>}      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map(s => (
          <div
            key={s.slug}
            onClick={() => toScenarioStep(workspaceSlug, s.slug, 0)}
            className={`rounded border bg-white shadow-sm overflow-hidden transition-all ${
              isActive(s.status) 
                ? 'ring-1 ring-blue-500' 
                : 'hover:shadow cursor-pointer'
            }`}
          >
            <div className="p-4 pb-3">
              <div className="h-10 md:h-16"></div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold break-words">
                  {s.name}
                </h3>
              </div>
              <p className="text-gray-500 text-xs line-clamp-2 mt-1 h-8">
                {s.description || "No description available"}
              </p>
            </div>
            
            <div className="px-4 pt-0 pb-2">
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                {getStatusIcon(s.status)}
              </div>
            </div>
            
            <div className="flex items-center p-4 pt-2">
              {isActive(s.status) ? (
                <button 
                  className="inline-flex items-center justify-center rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 w-full gap-1.5 text-xs py-1.5"
                  disabled={isActive(s.status)}
                >
                  <Play className="h-3 w-3" />
                  Start
                </button>
              ) : (
                <div className="w-full h-8"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}