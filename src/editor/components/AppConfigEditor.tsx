// src/editor/components/AppConfigEditor.tsx (bez zmian funkcjonalnych, ale dopasowanie do hooka jeśli potrzeba)
import React, { useState } from "react";
import { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { EditorTabs } from "./common/EditorTabs";
import { EditorCard } from "./common/EditorCard";

export const AppConfigEditor: React.FC<{
  config: AppConfig;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  onUpdate: (u: Partial<AppConfig>) => void;
}> = ({ config, workspaces, scenarios, onUpdate }) => {
  const [tab, setTab] = useState<"form" | "json">("form");
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", title: "Nazwa" },
      description: { type: "string", title: "Opis" },
      tplDir: { type: "string", title: "Katalog" },
      defaultWorkspace: {
        type: "string",
        title: "Domyślna przestrzeń robocza",
        enum: workspaces.map((w) => w.slug),
        enumNames: workspaces.map((w) => w.name || w.slug),
      },
      defaultScenario: {
        type: "string",
        title: "Domyślny scenariusz",
        enum: scenarios.map((s) => s.slug),
        enumNames: scenarios.map((s) => s.name || s.slug),
      },
    },
    required: ["name", "tplDir"],
  };

  return (
    <EditorCard title="Konfiguracja aplikacji">
      <EditorTabs
        activeTab={tab}
        options={[
          { id: "form", label: "Form" },
          { id: "json", label: "JSON" },
        ]}
        onChange={(t) => setTab(t as any)}
      />
      <div className="p-4">
        {tab === "form" ? (
          <FormEditor schema={schema} formData={config} onChange={onUpdate} />
        ) : (
          <JsonEditor value={config} onChange={onUpdate} />
        )}
      </div>
    </EditorCard>
  );
};