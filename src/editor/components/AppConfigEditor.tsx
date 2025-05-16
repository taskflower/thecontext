// src/editor/components/AppConfigEditor.tsx
import React, { useState } from "react";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";

interface AppConfigEditorProps {
  config: AppConfig;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  onUpdate: (updatedConfig: Partial<AppConfig>) => void;
}

export const AppConfigEditor: React.FC<AppConfigEditorProps> = ({
  config,
  workspaces,
  scenarios,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  
  // Generuj formularz schema dla głównej konfiguracji
  const formSchema = {
    type: "object",
    properties: {
      name: { 
        type: "string", 
        title: "Nazwa aplikacji",
      },
      description: { 
        type: "string", 
        title: "Opis aplikacji"
      },
      tplDir: { 
        type: "string", 
        title: "Katalog szablonu",
        default: "default"
      },
      defaultWorkspace: { 
        type: "string", 
        title: "Domyślna przestrzeń robocza",
        enum: workspaces.map(w => w.slug),
        enumNames: workspaces.map(w => w.name || w.slug)
      },
      defaultScenario: { 
        type: "string", 
        title: "Domyślny scenariusz",
        enum: scenarios.map(s => s.slug),
        enumNames: scenarios.map(s => s.name || s.slug)
      }
    },
    required: ["name", "tplDir"]
  };
  
  // Obsługa zmian w formularzu
  const handleFormChange = (formData: any) => {
    onUpdate(formData);
  };
  
  // Obsługa zmian w edytorze JSON
  const handleJsonChange = (jsonData: any) => {
    // Usuń workspaces i scenarios z edytora JSON, żeby nie duplikować
    const { workspaces: _, scenarios: __, ...appConfig } = jsonData;
    onUpdate(appConfig);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-800">Konfiguracja aplikacji</h2>
        <p className="text-sm text-gray-500">
          Edytuj podstawowe ustawienia aplikacji
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
            Formularz
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
        {activeTab === "form" ? (
          <FormEditor 
            schema={formSchema}
            formData={{
              name: config.name,
              description: config.description,
              tplDir: config.tplDir,
              defaultWorkspace: config.defaultWorkspace,
              defaultScenario: config.defaultScenario
            }}
            onChange={handleFormChange}
          />
        ) : (
          <JsonEditor 
            value={{
              name: config.name,
              description: config.description,
              tplDir: config.tplDir,
              defaultWorkspace: config.defaultWorkspace,
              defaultScenario: config.defaultScenario
            }}
            onChange={handleJsonChange}
          />
        )}
      </div>
    </div>
  );
};