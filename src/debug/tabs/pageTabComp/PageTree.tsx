import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Building2,
  BarChart4,
  Check,
  Layers,
 Box
} from "lucide-react";
import { PageTabConfig, SelectedItems } from "./types";

interface PageTreeProps {
  config: PageTabConfig;
  selectedItems: SelectedItems;
  expandedWorkspace: string | null;
  expandedScenario: string | null;
  onToggleWorkspace: (slug: string, e: React.MouseEvent) => void;
  onToggleScenario: (slug: string, e: React.MouseEvent) => void;
  onWorkspaceClick: (slug: string, e: React.MouseEvent) => void;
  onScenarioClick: (
    workspaceSlug: string,
    scenarioSlug: string,
    e: React.MouseEvent
  ) => void;
  onStepClick: (
    workspaceSlug: string,
    scenarioSlug: string,
    stepIdx: number,
    e: React.MouseEvent
  ) => void;
}

export const PageTree: React.FC<PageTreeProps> = ({
  config,
  selectedItems,
  expandedWorkspace,
  expandedScenario,
  onToggleWorkspace,
  onToggleScenario,
  onWorkspaceClick,
  onScenarioClick,
  onStepClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const actualConfigId = location.pathname.split("/")[1] || "defaultConfig";

  return (
    <div className="col-span-4 bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className=" p-2 border-b border-gray-200">
        <div
          onClick={() => navigate(`/${actualConfigId}`)}
          className="text-sm font-medium hover:text-blue-800 flex items-center cursor-pointer"
        >
          <Box className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{config.name || actualConfigId}</span>
        </div>
      </div>

      {/* Workspace list */}
      <div className="text-xs divide-y divide-gray-100 overflow-auto max-h-[calc(100vh-180px)]">
        {config.workspaces.map((workspace) => {
          const scenariosForWorkspace = config.scenarios.filter(
            (scenario) => scenario.workspaceSlug === workspace.slug
          );
          const isCurrent = workspace.slug === selectedItems.workspace;
          const isExpanded = expandedWorkspace === workspace.slug;

          return (
            <div
              key={workspace.slug}
              className={`${
                isCurrent ? "border-l-4 border-blue-300" : ""
              } transition-colors duration-100`}
            >
              <div
                className={`p-2 flex items-center justify-between cursor-pointer ${
                  isCurrent ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={(e) => onWorkspaceClick(workspace.slug, e)}
              >
                <div
                  className={`${
                    isCurrent ? "text-blue-700 font-medium" : "text-gray-700"
                  } flex-1 flex items-center`}
                >
                  {workspace.icon ? (
                    <BarChart4 className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <Building2
                      className={`h-4 w-4 mr-2 flex-shrink-0 ${
                        isCurrent ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                  )}
                  <span className="truncate">
                    {workspace.name || workspace.slug}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-400 text-xs mr-2 px-1.5 py-0.5  rounded-full">
                    {scenariosForWorkspace.length}
                  </span>
                  <button
                    className="text-gray-400 h-5 w-5 flex items-center justify-center hover:bg-gray-100 rounded"
                    onClick={(e) => onToggleWorkspace(workspace.slug, e)}
                    aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="pl-1 pr-1 pb-1 ">
                  {scenariosForWorkspace.length > 0 ? (
                    scenariosForWorkspace.map((scenario) => {
                      const nodes = scenario.nodes
                        ? [...scenario.nodes].sort(
                            (a, b) => (a.order || 0) - (b.order || 0)
                          )
                        : [];
                      const isScCurrent =
                        scenario.slug === selectedItems.scenario;
                      const isScExpanded = expandedScenario === scenario.slug;

                      return (
                        <div
                          key={scenario.slug}
                          className={`mt-1 rounded-md border ${
                            isScCurrent 
                              ? "border-blue-200 bg-blue-50" 
                              : "border-gray-200 bg-white"
                          } overflow-hidden transition-colors duration-100`}
                        >
                          <div
                            className="px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            onClick={(e) =>
                              onScenarioClick(workspace.slug, scenario.slug, e)
                            }
                          >
                            <div
                              className={`${
                                isScCurrent ? "font-semibold text-blue-700" : "text-gray-700"
                              } flex-1 flex items-center text-sx`}
                            >
                              {scenario.icon ? (
                                <BarChart4 className="h-4 w-4 mr-2 flex-shrink-0" />
                              ) : (
                                <Layers
                                  className={`h-4 w-4 mr-2 flex-shrink-0 ${
                                    isScCurrent
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                />
                              )}
                              <span className="truncate">
                                {scenario.name || scenario.slug}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-400 text-xs mr-1.5 px-1.5 py-0.5 bg-gray-100 rounded-full">
                                {nodes.length}
                              </span>
                              <button
                                className="text-gray-400 h-5 w-5 flex items-center justify-center hover:bg-gray-100 rounded"
                                onClick={(e) =>
                                  onToggleScenario(scenario.slug, e)
                                }
                                aria-label={isScExpanded ? "Zwiń" : "Rozwiń"}
                              >
                                {isScExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isScExpanded && nodes.length > 0 && (
                            <div className="pl-1 pr-1 py-1 space-y-1 bg-gray-50 border-t border-gray-200">
                              {nodes.map((node, idx) => {
                                const isActive =
                                  selectedItems.scenario === scenario.slug &&
                                  selectedItems.step === idx;
                                return (
                                  <div
                                    key={node.slug || idx}
                                    className={`${
                                      isActive
                                        ? "bg-gray-800 text-gray-100 font-medium border"
                                        : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-600"
                                    } p-1.5 rounded-md flex items-center cursor-pointer text-xs`}
                                    onClick={(e) =>
                                      onStepClick(
                                        workspace.slug,
                                        scenario.slug,
                                        idx,
                                        e
                                      )
                                    }
                                  >
                                    <div className="w-6 flex-shrink-0 flex justify-center">
                                      {isActive ? (
                                        <Check className="h-4 w-4 text-green-400" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-gray-400" />
                                      )}
                                    </div>
                                    <span className="truncate">
                                      {idx + 1}.{" "}
                                      {node.label || `Krok ${idx + 1}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 p-2 text-xs italic bg-white rounded-md border border-gray-200 mt-1">
                      Brak dostępnych scenariuszy
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};