import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { useAppNavigation } from "@/core/navigation";
import { ChevronRight } from "lucide-react";
import { I } from "@/components";

// Używamy tylko właściwości, które są potwierdzone w kodzie
type ScenarioListWidgetProps = {
  title?: string;
};

export default function ScenarioListWidget({ 
  title = "Scenariusze"
}: ScenarioListWidgetProps) {
  const { config } = useConfig();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { toScenarioStep } = useAppNavigation();

  // Filter scenarios for the current workspace
  const scenarios = useMemo(() => {
    if (!config || !workspaceSlug) return [];
    
    return config.scenarios.filter(s => s.workspaceSlug === workspaceSlug);
  }, [config, workspaceSlug]);

  if (!workspaceSlug) {
    return null;
  }

  if (!scenarios.length) {
    return (
      <div className="h-full flex flex-col">
        {title && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="m-0 text-sm font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-4 flex-grow flex items-center justify-center">
          <p className="text-sm text-gray-500">Brak dostępnych scenariuszy</p>
        </div>
      </div>
    );
  }

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
              onClick={() => {
                if (workspaceSlug) {
                  toScenarioStep(workspaceSlug, s.slug, 0);
                }
              }}
              className="rounded border bg-white shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md flex flex-col h-full hover:border-gray-300"
            >
              <div className="p-4 flex-grow">
                <div className="h-10 md:h-16 flex items-center">
                  {s.icon && <I name={s.icon} className="w-6 h-6 text-gray-500" />}
                </div>

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