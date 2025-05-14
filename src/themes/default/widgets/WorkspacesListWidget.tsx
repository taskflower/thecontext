import { useMemo } from "react";
import { useAppNavigation } from "@/core/navigation";
import { useParams } from "react-router-dom";
import { getScenarioCounts, type AppConfig } from "@/core";
import LuIcon from "@/components/LuIcon";

type Workspace = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
};

type WorkspacesWidgetProps = {
  title?: string;
  config: AppConfig;
  emptyMessage?: string;
};

export default function WorkspacesWidget({
  title = "Dostępne obszary robocze",
  config,
  emptyMessage = "Brak dostępnych obszarów roboczych",
}: WorkspacesWidgetProps) {
  const { toWorkspace } = useAppNavigation();
  const { workspaceSlug: currentWorkspace } = useParams<{
    workspaceSlug: string;
  }>();

  const workspaces: Workspace[] = useMemo(
    () => config.workspaces || [],
    [config.workspaces]
  );

  const scenarioCounts = useMemo(
    () => getScenarioCounts(config),
    [config.scenarios]
  );

  if (!workspaces.length) {
    return (
      <div className="p-4">
        <div className="py-4 text-center text-gray-500 bg-gray-50 rounded border border-gray-200 text-xs">
          {emptyMessage}
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
          {workspaces.map((workspace) => {
            const isActive = workspace.slug === currentWorkspace;

            return (
              <div
                key={workspace.slug}
                onClick={() => toWorkspace(workspace.slug)}
                className="rounded border bg-white shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md flex flex-col h-full hover:border-gray-300"
              >
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <LuIcon name="folder" className="text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {scenarioCounts[workspace.slug] || 0} scenariuszy
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {workspace.name}
                    </h3>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-800">
                        Aktywny
                      </span>
                    )}
                  </div>

                  {workspace.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {workspace.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto px-4 py-3 text-center border-t border-gray-100 bg-gray-50">
                  {isActive ? (
                    <span className="text-xs text-gray-600 font-medium">
                      Obecnie wybrany
                    </span>
                  ) : (
                    <button
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toWorkspace(workspace.slug);
                      }}
                    >
                      Otwórz obszar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
