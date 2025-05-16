// src/editor/components/ScenarioEditor.tsx
import React, { useState } from "react";
import { ScenarioConfig, NodeConfig } from "@/core/types";
import { JsonEditor } from "./common/JsonEditor";
import { FormEditor } from "./common/FormEditor";
import { NodeEditor } from "./scenario/NodeEditor";
import { EditorTabs } from "./common/EditorTabs";
import { EditorCard } from "./common/EditorCard";
import { PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react";

interface ScenarioEditorProps {
  scenario: ScenarioConfig;
  onUpdate: (updatedScenario: Partial<ScenarioConfig>) => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  scenario,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "nodes" | "json">("form");

  // Generuj formularz schema dla scenariusza
  const formSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Nazwa scenariusza",
      },
      description: {
        type: "string",
        title: "Opis scenariusza",
      },
      icon: {
        type: "string",
        title: "Ikona",
        enum: ["search", "chart", "info", "money", "briefcase", "calculator"],
        default: "info",
      }
    },
    required: ["name"],
  };

  // Obsługa zmian w formularzu
  const handleFormChange = (formData: any) => {
    onUpdate(formData);
  };

  // Obsługa zmian w edytorze JSON
  const handleJsonChange = (jsonData: any) => {
    onUpdate(jsonData);
  };

  // Dodaj nowy krok (node) do scenariusza
  const addNode = () => {
    const nodes = scenario.nodes || [];
    const maxOrder =
      nodes.length > 0 ? Math.max(...nodes.map((n) => n.order || 0)) : -1;

    const newNode: NodeConfig = {
      slug: `step-${Date.now()}`,
      label: `Nowy krok ${nodes.length + 1}`,
      description: "Opis nowego kroku",
      tplFile: "FormStep",
      order: maxOrder + 1,
      contextSchemaPath: "",
      contextDataPath: "",
      attrs: {
        title: `Nowy krok ${nodes.length + 1}`,
        description: "Opis nowego kroku",
      },
    };

    onUpdate({
      nodes: [...nodes, newNode],
    });
  };

  // Aktualizuj krok
  const updateNode = (index: number, updatedNode: Partial<NodeConfig>) => {
    const nodes = [...(scenario.nodes || [])];
    nodes[index] = { ...nodes[index], ...updatedNode };

    onUpdate({ nodes });
  };

  // Usuń krok
  const deleteNode = (index: number) => {
    if (
      !confirm(
        "Czy na pewno chcesz usunąć ten krok? Ta operacja jest nieodwracalna."
      )
    ) {
      return;
    }

    const nodes = (scenario.nodes || []).filter((_, i) => i !== index);

    // Zaktualizuj numerację order
    const updatedNodes = nodes.map((node, i) => ({
      ...node,
      order: i,
    }));

    onUpdate({ nodes: updatedNodes });
  };

  // Przesuń krok w górę
  const moveNodeUp = (index: number) => {
    if (index === 0) return;

    const nodes = [...(scenario.nodes || [])];
    const node = nodes[index];
    const prevNode = nodes[index - 1];

    // Zamień order
    const nodeOrder = node.order || 0;
    const prevNodeOrder = prevNode.order || 0;

    nodes[index] = { ...node, order: prevNodeOrder };
    nodes[index - 1] = { ...prevNode, order: nodeOrder };

    // Posortuj według order
    const sortedNodes = [...nodes].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    onUpdate({ nodes: sortedNodes });
  };

  // Przesuń krok w dół
  const moveNodeDown = (index: number) => {
    const nodes = [...(scenario.nodes || [])];
    if (index === nodes.length - 1) return;

    const node = nodes[index];
    const nextNode = nodes[index + 1];

    // Zamień order
    const nodeOrder = node.order || 0;
    const nextNodeOrder = nextNode.order || 0;

    nodes[index] = { ...node, order: nextNodeOrder };
    nodes[index + 1] = { ...nextNode, order: nodeOrder };

    // Posortuj według order
    const sortedNodes = [...nodes].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    onUpdate({ nodes: sortedNodes });
  };

  // Posortowane kroki według order
  const sortedNodes = [...(scenario.nodes || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const tabOptions = [
    { id: "form", label: "Podstawowe" },
    { id: "nodes", label: "Kroki (Nodes)" },
    { id: "json", label: "JSON" }
  ];

  return (
    <div className="space-y-6">
      <EditorCard
        title={`Scenariusz: ${scenario.name || scenario.slug}`}
        description={scenario.description || "Brak opisu"}
      >
        <EditorTabs 
          activeTab={activeTab}
          options={tabOptions}
          onChange={(tab) => setActiveTab(tab as "form" | "nodes" | "json")}
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
              onChange={handleFormChange}
            />
          )}

          {activeTab === "nodes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Kroki scenariusza
                </h3>
                <button
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  onClick={addNode}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Dodaj krok
                </button>
              </div>

              {sortedNodes.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                  Brak zdefiniowanych kroków. Kliknij "Dodaj krok" aby
                  rozpocząć.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedNodes.map((node, index) => (
                    <div
                      key={node.slug || index}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div className="bg-lime-100 border-b border-gray-200 p-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-5 h-5 bg-blue-100 rounded-full text-xs flex items-center justify-center mr-2 text-blue-800">
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm">
                            {node.label || `Krok ${index + 1}`}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({node.tplFile})
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveNodeUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-200"
                            }`}
                            title="Przesuń w górę"
                          >
                            <MoveUp className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => moveNodeDown(index)}
                            disabled={index === sortedNodes.length - 1}
                            className={`p-1 rounded ${
                              index === sortedNodes.length - 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-200"
                            }`}
                            title="Przesuń w dół"
                          >
                            <MoveDown className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteNode(index)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded"
                            title="Usuń krok"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3">
                        <NodeEditor
                          node={node}
                          onUpdate={(updatedNode) =>
                            updateNode(index, updatedNode)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "json" && (
            <JsonEditor value={scenario} onChange={handleJsonChange} />
          )}
        </div>
      </EditorCard>
    </div>
  );
};