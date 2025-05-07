// src/themes/default/widgets/ScenarioListWidget.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Hourglass } from 'lucide-react';
import type { AppConfig } from '../../../core/types';

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
  const navigate = useNavigate();

  // Filtruj scenariusze dla tego workspace
  const scenarios: Scenario[] = React.useMemo(
    () => config.scenarios.filter(s => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <Hourglass className="h-3.5 w-3.5" />;
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      default:
        return null;
    }
  };

  const isActive = (status?: string) => status === 'active';

  return (
    <div className="pt-6">
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(s => (
          <div
            key={s.slug}
            onClick={() => navigate(`/${workspaceSlug}/${s.slug}/0`)}
            className={`rounded-lg border bg-white text-gray-900 shadow-sm overflow-hidden transition-all duration-200 ${
              isActive(s.status) 
                ? 'opacity-70 ring-2 ring-blue-500' 
                : 'hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
              <div className="h-12 md:h-24"></div>
              <div className="flex justify-between items-start">
                <h3 className="tracking-tight text-base sm:text-lg font-bold break-words">
                  {s.name}
                </h3>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1">
                {s.description || "No description available"}
              </p>
            </div>
            
            <div className="p-6 pt-0 pb-2">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  {getStatusIcon(s.status)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-6 pt-3">
              {isActive(s.status) ? (
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 w-full gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                  disabled={isActive(s.status)}
                >
                  <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Start
                </button>
              ) : (
                <div className="w-full h-8 sm:h-10"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}