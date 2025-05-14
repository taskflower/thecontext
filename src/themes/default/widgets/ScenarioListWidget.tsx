import { useMemo } from "react";
import { AppConfig } from "@/core";
import { useAppNavigation } from "@/core/navigation";
import { ChevronRight } from "lucide-react";

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
  const { toScenarioStep } = useAppNavigation();

  // Filtruj scenariusze dla tego workspace
  const scenarios: Scenario[] = useMemo(
    () => config.scenarios.filter((s) => s.workspaceSlug === workspaceSlug),
    [config.scenarios, workspaceSlug]
  );

  return (
    <div className="h-full">
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="m-0 text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <div
              key={s.slug}
              onClick={() => toScenarioStep(workspaceSlug, s.slug, 0)}
              className="rounded border bg-white shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md flex flex-col h-full hover:border-gray-300"
            >
              <div className="p-4 flex-grow">
                <div className="h-10 md:h-16"></div>

                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-800 break-words">
                    {s.name}
                  </h3>
                </div>

                {s.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 h-8">
                    {s.description || "Brak opisu"}
                  </p>
                )}
              </div>

              <div className="mt-auto px-4 py-3 flex items-center justify-end border-t border-gray-100 ">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
