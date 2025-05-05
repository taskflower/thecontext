// src/_modules/debug/tabs/ScenarioTab.tsx
import React from "react";
import { List, Settings, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Scenario, Workspace } from "@/types";

interface ScenarioTabProps {
  currentScenario: Scenario | undefined;
  currentWorkspace: Workspace | undefined;
}

export const ScenarioTab: React.FC<ScenarioTabProps> = ({ 
  currentScenario, 
  currentWorkspace 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex flex-col space-y-4 h-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Informacje o scenariuszu
          </h3>
         
        </div>

        <div className="space-y-4 overflow-auto pb-4">
          {currentWorkspace ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3">
                <h4 className="text-sm font-medium flex items-center text-blue-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Workspace
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-gray-700">ID:</div>
                  <div className="font-mono text-xs text-gray-800">{currentWorkspace.id}</div>

                  <div className="font-medium text-gray-700">Nazwa:</div>
                  <div className="text-gray-800">{currentWorkspace.name}</div>

                  <div className="font-medium text-gray-700">Scenariusze:</div>
                  <div className="text-gray-800">{currentWorkspace.scenarios?.length || 0}</div>

                  <div className="font-medium text-gray-700">Szablon:</div>
                  <div className="text-gray-800">
                    {currentWorkspace.templateSettings?.tplDir || "default"}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {currentScenario ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3">
                <h4 className="text-sm font-medium flex items-center text-green-700">
                  <List className="w-4 h-4 mr-2" />
                  Aktywny scenariusz
                </h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-gray-700">ID:</div>
                  <div className="font-mono text-xs text-gray-800">{currentScenario.id}</div>

                  <div className="font-medium text-gray-700">Nazwa:</div>
                  <div className="text-gray-800">{currentScenario.name}</div>

                  <div className="font-medium text-gray-700">Opis:</div>
                  <div className="text-gray-800">{currentScenario.description || "-"}</div>

                  <div className="font-medium text-gray-700">Kroki:</div>
                  <div className="text-gray-800">{currentScenario.nodes?.length || 0}</div>
                </div>

                {currentScenario.nodes && currentScenario.nodes.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2 text-gray-800">Lista kroków:</h5>
                    <div className="overflow-hidden border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Etykieta
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Szablon
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Ścieżka kontekstu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentScenario.nodes.map((node, index) => (
                            <tr
                              key={node.id}
                              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <td className="px-3 py-1.5 font-mono text-xs text-gray-800">
                                {node.id}
                              </td>
                              <td className="px-3 py-1.5 text-gray-800">{node.label || "-"}</td>
                              <td className="px-3 py-1.5 text-gray-800">
                                {node.tplFile || "-"}
                              </td>
                              <td className="px-3 py-1.5 font-mono text-xs text-gray-800">
                                {node.contextPath || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-500">
                <p>Brak aktywnego scenariusza</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioTab;