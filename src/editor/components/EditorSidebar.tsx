// src/editor/components/EditorSidebar.tsx
import React, { useState } from "react";
import { WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { 
  ChevronRight, 
  ChevronDown, 
  PlusCircle, 
  Trash2, 
  Layers, 
  FileText, 
  Settings, 
  Building2,
  Box
} from "lucide-react";

interface EditorSidebarProps {
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  activeSection: "app" | "workspace" | "scenario";
  selectedWorkspace?: string;
  selectedScenario?: string;
  onChangeSection: (
    section: "app" | "workspace" | "scenario", 
    workspaceSlug?: string, 
    scenarioSlug?: string
  ) => void;
  onAddWorkspace: () => void;
  onDeleteWorkspace: (workspaceSlug: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  workspaces,
  scenarios,
  activeSection,
  selectedWorkspace,
  selectedScenario,
  onChangeSection,
  onAddWorkspace,
  onDeleteWorkspace
}) => {
  // Stan dla rozwiniętych elementów
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});
  
  // Przełączanie rozwinięcia workspace
  const toggleWorkspace = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpandedWorkspaces(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };
  
  // Kliknięcie workspace
  const handleWorkspaceClick = (slug: string) => {
    onChangeSection("workspace", slug);
  };
  
  // Kliknięcie scenariusza
  const handleScenarioClick = (workspaceSlug: string, scenarioSlug: string) => {
    onChangeSection("scenario", workspaceSlug, scenarioSlug);
  };
  
  return (
    <div className="p-2 flex flex-col h-full">
      {/* Nagłówek z przyciskiem dodawania workspace */}
      <div className="flex items-center justify-between mb-3 py-2 px-2 bg-gray-50 rounded-md">
        <h2 className="text-sm font-medium text-gray-700 flex items-center">
          <Settings className="h-4 w-4 mr-1.5" />
          Elementy konfiguracji
        </h2>
        <button
          onClick={onAddWorkspace}
          className="text-blue-600 hover:text-blue-800"
          title="Dodaj przestrzeń roboczą"
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>
      
      {/* Główna konfiguracja */}
      <div 
        className={`mb-2 flex items-center p-2 rounded-md cursor-pointer ${
          activeSection === "app" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onChangeSection("app")}
      >
        <Box className="h-4 w-4 mr-1.5" />
        <span className="text-sm">Konfiguracja główna</span>
      </div>
      
      {/* Lista workspace'ów */}
      <div className="flex-1 overflow-auto">
        {workspaces.length === 0 ? (
          <div className="text-xs text-gray-500 italic p-2">
            Brak zdefiniowanych przestrzeni roboczych
          </div>
        ) : (
          <div className="space-y-1">
            {workspaces.map(workspace => {
              const isExpanded = !!expandedWorkspaces[workspace.slug];
              const isSelected = activeSection === "workspace" && selectedWorkspace === workspace.slug;
              const scenariosForWorkspace = scenarios.filter(s => s.workspaceSlug === workspace.slug);
              
              return (
                <div key={workspace.slug} className="text-xs">
                  <div 
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                      isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleWorkspaceClick(workspace.slug)}
                  >
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1.5" />
                      <span>{workspace.name || workspace.slug}</span>
                    </div>
                    
                    <div className="flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkspace(workspace.slug);
                        }}
                        className="text-gray-400 hover:text-red-600 mr-1.5"
                        title="Usuń przestrzeń"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={(e) => toggleWorkspace(workspace.slug, e)}
                        className="text-gray-400 hover:text-gray-700"
                        title={isExpanded ? "Zwiń" : "Rozwiń"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Lista scenariuszy dla danego workspace */}
                  {isExpanded && (
                    <div className="pl-4 pr-1 mt-1 mb-2 space-y-1">
                      {scenariosForWorkspace.length > 0 ? (
                        scenariosForWorkspace.map(scenario => {
                          const isScenarioSelected = activeSection === "scenario" && 
                            selectedScenario === scenario.slug;
                          
                          return (
                            <div 
                              key={scenario.slug}
                              className={`flex items-center p-1.5 rounded-md cursor-pointer ${
                                isScenarioSelected 
                                  ? "bg-blue-50 text-blue-700" 
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => handleScenarioClick(workspace.slug, scenario.slug)}
                            >
                              <Layers className="h-3.5 w-3.5 mr-1.5" />
                              <span className="truncate">{scenario.name || scenario.slug}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 italic p-1.5">
                          Brak scenariuszy
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};