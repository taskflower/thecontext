// src/editor/components/WorkspaceEditor.tsx
import React, { useState } from "react";
import { WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { Widget } from "./workspace/Widget";
import { PlusCircle, Layers, Trash2 } from "lucide-react";

interface WorkspaceEditorProps {
  workspace: WorkspaceConfig;
  onUpdate: (updatedWorkspace: Partial<WorkspaceConfig>) => void;
  onAddScenario: () => void;
  scenarios: ScenarioConfig[];
  onEditScenario: (scenarioSlug: string) => void;
  onDeleteScenario: (scenarioSlug: string) => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  workspace,
  onUpdate,
  onAddScenario,
  scenarios,
  onEditScenario,
  onDeleteScenario
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "widgets" | "json">("form");
  
  // Generuj formularz schema dla workspace
  const formSchema = {
    type: "object",
    properties: {
      name: { 
        type: "string", 
        title: "Nazwa przestrzeni"
      },
      description: { 
        type: "string", 
        title: "Opis przestrzeni"
      },
      icon: { 
        type: "string", 
        title: "Ikona",
        enum: ["search", "chart", "info", "money", "briefcase", "calculator"],
        default: "info"
      },
      tplDir: { 
        type: "string", 
        title: "Katalog szablonu",
        default: "default"
      }
    },
    required: ["name"]
  };
  
  // Obsługa zmian w formularzu
  const handleFormChange = (formData: any) => {
    onUpdate(formData);
  };
  
  // Obsługa zmian w edytorze JSON
  const handleJsonChange = (jsonData: any) => {
    onUpdate(jsonData);
  };
  
  // Dodaj widget do workspace
  const addWidget = () => {
    const templateSettings = workspace.templateSettings || { widgets: [] };
    const widgets = templateSettings.widgets || [];
    
    const newWidget = {
      title: "Nowy widget",
      tplFile: "InfoWidget",
      data: "Treść widgetu",
      icon: "info",
      colSpan: 1
    };
    
    onUpdate({
      templateSettings: {
        ...templateSettings,
        widgets: [...widgets, newWidget]
      }
    });
  };
  
  // Aktualizuj widget
  const updateWidget = (index: number, updatedWidget: any) => {
    const templateSettings = workspace.templateSettings || { widgets: [] };
    const widgets = templateSettings.widgets || [];
    
    const updatedWidgets = [...widgets];
    updatedWidgets[index] = { ...updatedWidgets[index], ...updatedWidget };
    
    onUpdate({
      templateSettings: {
        ...templateSettings,
        widgets: updatedWidgets
      }
    });
  };
  
  // Usuń widget
  const deleteWidget = (index: number) => {
    const templateSettings = workspace.templateSettings || { widgets: [] };
    const widgets = templateSettings.widgets || [];
    
    const updatedWidgets = widgets.filter((_, i) => i !== index);
    
    onUpdate({
      templateSettings: {
        ...templateSettings,
        widgets: updatedWidgets
      }
    });
  };
  
  // Aktualizuj layout
  const updateLayout = (layoutFile: string) => {
    const templateSettings = workspace.templateSettings || { widgets: [] };
    
    onUpdate({
      templateSettings: {
        ...templateSettings,
        layoutFile
      }
    });
  };
  
  const widgets = workspace.templateSettings?.widgets || [];
  
  return (
    <div className="space-y-6">
      {/* Informacje o przestrzeni */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Przestrzeń: {workspace.name || workspace.slug}
          </h2>
          <p className="text-sm text-gray-500">
            {workspace.description || "Brak opisu"}
          </p>
        </div>
        
        {/* Przyciski zmiany trybu edycji */}
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === "form"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("form")}
            >
              Podstawowe
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === "widgets"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("widgets")}
            >
              Widgety
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === "json"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("json")}
            >
              JSON
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === "form" && (
            <FormEditor 
              schema={formSchema}
              formData={{
                name: workspace.name,
                description: workspace.description,
                icon: workspace.icon,
                tplDir: workspace.tplDir
              }}
              onChange={handleFormChange}
            />
          )}
          
          {activeTab === "widgets" && (
            <div className="space-y-4">
              {/* Layout selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Układ przestrzeni
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={workspace.templateSettings?.layoutFile || "Simple"}
                  onChange={(e) => updateLayout(e.target.value)}
                >
                  <option value="Simple">Simple</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="SidebarLayout">SidebarLayout</option>
                </select>
              </div>
              
              {/* Widgety */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Widgety</h3>
                  <button
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                    onClick={addWidget}
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Dodaj widget
                  </button>
                </div>
                
                {widgets.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                    Brak zdefiniowanych widgetów
                  </div>
                ) : (
                  <div className="space-y-4">
                    {widgets.map((widget, index) => (
                      <Widget 
                        key={index}
                        widget={widget}
                        index={index}
                        onUpdate={(updatedWidget) => updateWidget(index, updatedWidget)}
                        onDelete={() => deleteWidget(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "json" && (
            <JsonEditor 
              value={workspace}
              onChange={handleJsonChange}
            />
          )}
        </div>
      </div>
      
      {/* Scenariusze */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">Scenariusze</h2>
          <button
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            onClick={onAddScenario}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Dodaj scenariusz
          </button>
        </div>
        
        <div className="p-4">
          {scenarios.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
              Brak zdefiniowanych scenariuszy dla tej przestrzeni
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenarios.map(scenario => (
                <div
                  key={scenario.slug}
                  className="border border-gray-200 rounded-md p-3 hover:border-blue-300 cursor-pointer"
                  onClick={() => onEditScenario(scenario.slug)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center">
                      <Layers className="h-4 w-4 mr-1.5 text-gray-500" />
                      {scenario.name || scenario.slug}
                    </h3>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScenario(scenario.slug);
                      }}
                      title="Usuń scenariusz"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {scenario.description || "Brak opisu"}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {scenario.nodes?.length || 0} kroków
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};