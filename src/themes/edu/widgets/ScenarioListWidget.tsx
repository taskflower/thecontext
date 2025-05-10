// src/themes/clean/widgets/ScenarioListWidget.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { AppConfig } from "../../../core/types";

type Scenario = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  workspaceSlug: string;
  status?: "active" | "completed" | "pending";
};

type ScenarioListWidgetProps = {
  title?: string;
  config: AppConfig;
  workspaceSlug: string;
};

export default function ScenarioListWidget({
  title,
  config,
  workspaceSlug,
}: ScenarioListWidgetProps) {
  const navigate = useNavigate();

  // Filter scenarios for this workspace
  const scenarios: Scenario[] = React.useMemo(
    () => config.scenarios.filter((s) => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  return (
    <div className="py-6">
      {title && (
        <h3 className="text-xl font-semibold text-slate-800 mb-6">{title}</h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <div
            key={s.slug}
            onClick={() => navigate(`/${workspaceSlug}/${s.slug}/0`)}
            className="bg-white rounded-lg border border-sky-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="p-5">
              <div className="flex items-center mb-4">
                {s.icon && (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                    {s.icon}
                  </div>
                )}
                <h4 className="font-semibold text-lg text-slate-800 group-hover:text-indigo-700">
                  {s.name}
                </h4>
              </div>

              {s.description && (
                <p className="text-slate-500 text-sm mb-6 group-hover:text-slate-600">
                  {s.description}
                </p>
              )}

              <div className="flex justify-end">
                <div className="inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
                  Rozpocznij <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
