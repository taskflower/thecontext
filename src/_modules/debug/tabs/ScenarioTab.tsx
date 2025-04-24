// src/debug/tabs/ScenarioTab.jsx

import { List, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ScenarioTab = ({ currentScenario, currentWorkspace }:any) => {
  const navigate = useNavigate();
  return (
    <div className="p-3 h-full overflow-auto">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Informacje o scenariuszu
        </h3>
        <button
            onClick={() => navigate('/generator')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Generator scenariuszy
          </button>
      </div>

      <div className="space-y-4">
        {currentWorkspace && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Workspace
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">ID:</div>
              <div className="font-mono">{currentWorkspace.id}</div>

              <div className="font-medium">Nazwa:</div>
              <div>{currentWorkspace.name}</div>

              <div className="font-medium">Scenariusze:</div>
              <div>{currentWorkspace.scenarios?.length || 0}</div>

              <div className="font-medium">Szablon:</div>
              <div>
                {currentWorkspace.templateSettings?.layoutTemplate || "default"}
              </div>
            </div>
          </div>
        )}

        {currentScenario ? (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <List className="w-4 h-4 mr-2" />
              Aktywny scenariusz
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">ID:</div>
              <div className="font-mono">{currentScenario.id}</div>

              <div className="font-medium">Nazwa:</div>
              <div>{currentScenario.name}</div>

              <div className="font-medium">Opis:</div>
              <div>{currentScenario.description || "-"}</div>

              <div className="font-medium">Kroki:</div>
              <div>{currentScenario.nodes?.length || 0}</div>
            </div>

            {currentScenario.nodes && currentScenario.nodes.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Lista kroków:</h5>
                <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
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
                      {currentScenario.nodes.map((node:any, index:any) => (
                        <tr
                          key={node.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-3 py-1.5 font-mono text-xs">
                            {node.id}
                          </td>
                          <td className="px-3 py-1.5">{node.label || "-"}</td>
                          <td className="px-3 py-1.5">
                            {node.templateId || node.type || "-"}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-xs">
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
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
            <p>Brak aktywnego scenariusza</p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ScenarioTab;