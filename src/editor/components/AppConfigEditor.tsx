// src/editor/components/AppConfigEditor.tsx
import React, { useState } from "react";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { EditorTabs } from "./common/EditorTabs";
import { EditorCard } from "./common/EditorCard";

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

  const tabOptions = [
    { id: "form", label: "Formularz" },
    { id: "json", label: "JSON" }
  ];
  
  return (
    <EditorCard 
      title="Konfiguracja aplikacji" 
      description="Edytuj podstawowe ustawienia aplikacji"
    >
      <EditorTabs 
        activeTab={activeTab}
        options={tabOptions}
        onChange={(tab) => setActiveTab(tab as "form" | "json")}
      />
      
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
    </EditorCard>
  );
};