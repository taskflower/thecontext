// src/themes/clean/widgets/ScenarioListWidget.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppConfig } from '../../../core/types';

type Scenario = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  workspaceSlug: string;
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

  // Filter scenarios for this workspace
  const scenarios: Scenario[] = React.useMemo(
    () => config.scenarios.filter(s => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  return (
    <div className="py-6">
      {title && <h3 className="text-xl font-semibold text-zinc-900 mb-6">{title}</h3>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map(s => (
          <div
            key={s.slug}
            onClick={() => navigate(`/${workspaceSlug}/${s.slug}/0`)}
            className="bg-white rounded-lg border shadow-sm hover:shadow transition-all cursor-pointer p-5 group"
          >
            <div className="flex items-center mb-3">
              {s.icon && (
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-500 group-hover:bg-blue-100 transition-colors">
                  {s.icon}
                </div>
              )}
              <h4 className="font-medium text-lg text-zinc-900 group-hover:text-zinc-800">{s.name}</h4>
            </div>
            {s.description && <p className="text-zinc-500 text-sm group-hover:text-zinc-600">{s.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}