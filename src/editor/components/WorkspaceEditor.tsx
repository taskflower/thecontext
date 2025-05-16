// src/editor/components/WorkspaceEditor.tsx
import React, { useState } from "react";
import { WorkspaceConfig, ScenarioConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { EditorTabs } from "./common/EditorTabs";
import { EditorCard } from "./common/EditorCard";

interface WorkspaceEditorProps {
  workspace: WorkspaceConfig;
  scenarios: ScenarioConfig[];
  onUpdate: (updated: Partial<WorkspaceConfig>) => void;
  onAddScenario: () => void;
  onEditScenario: (slug: string) => void;
  onDeleteScenario: (slug: string) => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  workspace,
  scenarios,
  onUpdate,
  onAddScenario,
  onEditScenario,
  onDeleteScenario,
}) => {
  const [tab, setTab] = useState<"form" | "widgets" | "json">("form");

  const schema = {
    type: "object",
    properties: {
      name: { type: "string", title: "Nazwa przestrzeni" },
      description: { type: "string", title: "Opis przestrzeni" },
      icon: {
        type: "string",
        title: "Ikona",
        enum: ["search", "chart", "info", "money", "briefcase", "calculator"],
      },
      tplDir: { type: "string", title: "Katalog szablonu" },
    },
    required: ["name"],
  };

  return (
    <EditorCard title={`Przestrzeń: ${workspace.name}`}>
      <EditorTabs
        activeTab={tab}
        options={[
          { id: "form", label: "Podstawowe" },
          { id: "widgets", label: "Widgety" },
          { id: "json", label: "JSON" },
        ]}
        onChange={(t) => setTab(t as any)}
      />
      <div className="p-4">
        {tab === "form" && (
          <FormEditor
            schema={schema}
            formData={{
              name: workspace.name,
              description: workspace.description,
              icon: workspace.icon,
              tplDir: workspace.templateSettings?.tplDir || "",
            }}
            onChange={onUpdate}
          />
        )}
        {tab === "widgets" && (
          <div className="text-gray-500 italic">Tu widgety…</div>
        )}
        {tab === "json" && <JsonEditor value={workspace} onChange={onUpdate} />}
      </div>

      <EditorCard title="Scenariusze">
        <div className="flex justify-end p-4">
          <button
            onClick={onAddScenario}
            className="text-blue-600 hover:underline"
          >
            Dodaj scenariusz
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((s) => (
            <div
              key={s.slug}
              className="border p-3 rounded flex justify-between"
            >
              <div
                onClick={() => onEditScenario(s.slug)}
                className="cursor-pointer"
              >
                <h4 className="font-medium">{s.name}</h4>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
              <button
                onClick={() => onDeleteScenario(s.slug)}
                className="text-red-600"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </EditorCard>
    </EditorCard>
  );
};
