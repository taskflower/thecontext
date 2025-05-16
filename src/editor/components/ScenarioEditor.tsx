// src/editor/components/ScenarioEditor.tsx
import React, { useState } from "react";
import { ScenarioConfig, NodeConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { EditorTabs } from "./common/EditorTabs";
import { EditorCard } from "./common/EditorCard";
import { PlusCircle } from "lucide-react";
import { NodeEditor } from "./scenario/NodeEditor";

interface ScenarioEditorProps {
  scenario: ScenarioConfig;
  onUpdate: (updatedScenario: Partial<ScenarioConfig>) => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  scenario,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "nodes" | "json">("form");

  const formSchema = {
    type: "object",
    properties: {
      name: { type: "string", title: "Nazwa scenariusza" },
      description: { type: "string", title: "Opis scenariusza" },
      icon: {
        type: "string",
        title: "Ikona",
        enum: ["search", "chart", "info", "money", "briefcase", "calculator"],
      },
    },
    required: ["name"],
  };

  const addNode = () => {
    const nodes = scenario.nodes || [];
    const maxOrder = nodes.length ? Math.max(...nodes.map((n) => n.order)) : -1;
    const newNode: NodeConfig = {
      slug: `step-${Date.now()}`,
      label: `Nowy krok ${nodes.length + 1}`,
      description: "",
      tplFile: "FormStep",
      order: maxOrder + 1,
      contextSchemaPath: "",
      contextDataPath: "",
      attrs: { title: `Nowy krok ${nodes.length + 1}`, description: "" },
    };
    onUpdate({ nodes: [...nodes, newNode] });
  };
  const updateNodes = (nodes: NodeConfig[]) => onUpdate({ nodes });

  const move = (i: number, dir: -1 | 1) => {
    const nodes = [...(scenario.nodes || [])];
    const j = i + dir;
    if (j < 0 || j >= nodes.length) return;
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    updateNodes(nodes.map((n, idx) => ({ ...n, order: idx })));
  };
  const remove = (i: number) => {
    if (!confirm("Usuń krok?")) return;
    const nodes = (scenario.nodes || [])
      .filter((_, idx) => idx !== i)
      .map((n, idx) => ({ ...n, order: idx }));
    updateNodes(nodes);
  };

  const sorted = [...(scenario.nodes || [])].sort((a, b) => a.order - b.order);

  return (
    <EditorCard
      title={`Scenariusz: ${scenario.name}`}
      description={scenario.description}
    >
      <EditorTabs
        activeTab={activeTab}
        options={[
          { id: "form", label: "Podstawowe" },
          { id: "nodes", label: "Kroki" },
          { id: "json", label: "JSON" },
        ]}
        onChange={(t) => setActiveTab(t as any)}
      />

      <div className="p-4">
        {activeTab === "form" && (
          <FormEditor
            schema={formSchema}
            formData={{
              name: scenario.name,
              description: scenario.description,
              icon: scenario.icon,
            }}
            onChange={onUpdate}
          />
        )}

        {activeTab === "nodes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Kroki</h3>
              <button
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                onClick={addNode}
              >
                <PlusCircle className="w-4 h-4 mr-1" /> Dodaj krok
              </button>
            </div>

            {sorted.length === 0 ? (
              <div className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">
                Brak kroków
              </div>
            ) : (
              sorted.map((node, idx) => (
                <div
                  key={node.slug}
                  className="border rounded-md overflow-hidden"
                >
                  <NodeEditor
                    node={node}
                    onUpdate={(u) => {
                      const nodes = [...sorted];
                      nodes[idx] = { ...nodes[idx], ...u };
                      updateNodes(nodes);
                    }}
                  />
                  <div className="p-2 flex justify-end space-x-2 text-xs">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0}>
                      ▲
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === sorted.length - 1}
                    >
                      ▼
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(idx)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "json" && (
          <JsonEditor value={scenario} onChange={onUpdate} height="600px" />
        )}
      </div>
    </EditorCard>
  );
};
