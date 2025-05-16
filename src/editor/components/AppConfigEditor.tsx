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
  onUpdate: (updated: Partial<AppConfig>) => void;
}

export const AppConfigEditor: React.FC<AppConfigEditorProps> = ({
  config,
  workspaces,
  scenarios,
  onUpdate,
}) => {
  const [tab, setTab] = useState<"form"|"json">("form");

  const schema = {
    type: "object",
    properties: {
      name: { type: "string", title: "Nazwa aplikacji" },
      description: { type: "string", title: "Opis aplikacji" },
      tplDir: { type: "string", title: "Katalog szablonu" },
      defaultWorkspace: {
        type: "string",
        title: "Domyślna przestrzeń",
        enum: workspaces.map(w => w.slug),
        enumNames: workspaces.map(w => w.name || w.slug),
      },
      defaultScenario: {
        type: "string",
        title: "Domyślny scenariusz",
        enum: scenarios.map(s => s.slug),
        enumNames: scenarios.map(s => s.name || s.slug),
      },
    },
    required: ["name","tplDir"],
  };

  return (
    <EditorCard title="Konfiguracja aplikacji">
      <EditorTabs
        activeTab={tab}
        options={[{id:"form",label:"Formularz"},{id:"json",label:"JSON"}]}
        onChange={t => setTab(t as any)}
      />
      <div className="p-4">
        {tab==="form" ? (
          <FormEditor
            schema={schema}
            formData={{
              name: config.name,
              description: config.description,
              tplDir: config.tplDir,
              defaultWorkspace: config.defaultWorkspace,
              defaultScenario: config.defaultScenario,
            }}
            onChange={(data) => onUpdate(data)}
          />
        ) : (
          <JsonEditor
            value={{
              name: config.name,
              description: config.description,
              tplDir: config.tplDir,
              defaultWorkspace: config.defaultWorkspace,
              defaultScenario: config.defaultScenario,
            }}
            onChange={onUpdate}
          />
        )}
      </div>
    </EditorCard>
  );
};
