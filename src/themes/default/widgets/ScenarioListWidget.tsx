// -------------------------------
// src/themes/default/widgets/ScenarioListWidget.tsx
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

  // Filtruj scenariusze dla tego workspace
  const scenarios: Scenario[] = React.useMemo(
    () => config.scenarios.filter(s => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  return (
    <div className="p-6">
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(s => (
          <div
            key={s.slug}
            onClick={() => navigate(`/${workspaceSlug}/${s.slug}/0`)}
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center mb-3">
              {s.icon && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-500">{s.icon}</span>
                </div>
              )}
              <h4 className="font-medium text-lg">{s.name}</h4>
            </div>
            {s.description && <p className="text-gray-600 text-sm">{s.description}</p>}
          </div>
        ))}
      </div>
    </div>)
}