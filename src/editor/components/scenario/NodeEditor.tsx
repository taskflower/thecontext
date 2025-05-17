// src/editor/components/scenario/NodeEditor.tsx
import React, { useState } from "react";
import { NodeConfig } from "@/core/types";
import { EditorCard } from "../common/EditorCard";
import { EditorTabs } from "../common/EditorTabs";
import { FormEditor } from "../common/FormEditor";
import { JsonEditor } from "../common/JsonEditor";

interface NodeEditorProps {
  node: NodeConfig;
  onUpdate: (updatedNode: Partial<NodeConfig>) => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "attrs" | "schema" | "json"
  >("basic");

  const stepTemplates = [
    "FormStep",
    "ApiStep",
    "WidgetsStep",
    "LlmStep",
    "DisplayStep",
    "ConfirmStep",
  ];

  const renderForm = () => {
    switch (activeTab) {
      case "basic":
        return (
          <FormEditor
            schema={{
              type: "object",
              properties: {
                label: { type: "string", title: "Etykieta kroku" },
                slug: { type: "string", title: "Identyfikator kroku" },
                tplFile: {
                  type: "string",
                  title: "Szablon kroku",
                  enum: stepTemplates,
                },
                contextSchemaPath: {
                  type: "string",
                  title: "Ścieżka schematu kontekstu",
                },
                contextDataPath: {
                  type: "string",
                  title: "Ścieżka danych kontekstu",
                },
              },
            }}
            formData={node}
            onChange={(data) => onUpdate(data)}
          />
        );

      case "attrs":
        const base = { title: { type: "string", title: "Tytuł" } };
        let schema: any = { type: "object", properties: base };

        if (node.tplFile === "FormStep") {
          schema.properties.submitLabel = {
            type: "string",
            title: "Etykieta przycisku",
          };
          schema.properties.jsonSchema = {
            type: "object",
            title: "JSON Schema",
          };
        } else if (node.tplFile === "ApiStep") {
          schema.properties = {
            ...base,
            description: { type: "string", title: "Opis" },
            apiEndpoint: { type: "string", title: "Endpoint API" },
            method: {
              type: "string",
              title: "Metoda HTTP",
              enum: ["GET", "POST", "PUT", "DELETE"],
            },
            payloadDataPath: { type: "string", title: "Payload Data Path" },
          };
        } else if (node.tplFile === "WidgetsStep") {
          schema.properties.subtitle = { type: "string", title: "Podtytuł" };
          schema.properties.widgets = {
            type: "array",
            title: "Widgety",
            items: { type: "string" },
          };
        } else if (node.tplFile === "LlmStep") {
          schema.properties.autoStart = {
            type: "boolean",
            title: "Auto Start",
          };
          schema.properties.userMessage = {
            type: "string",
            title: "Wiadomość użytkownika",
          };
        }

        return (
          <FormEditor
            schema={schema}
            formData={node.attrs || {}}
            onChange={(attrs) => onUpdate({ attrs })}
          />
        );

      case "schema":
        return (
          <FormEditor
            schema={{
              type: "object",
              properties: {
                saveToDB: {
                  type: "object",
                  title: "Zapis do bazy danych",
                  properties: {
                    enabled: { type: "boolean", title: "Aktywny" },
                    provider: {
                      type: "string",
                      title: "Provider",
                      enum: ["indexedDB", "firebase", "localStorage"],
                    },
                    itemType: { type: "string", title: "Typ elementu" },
                    itemTitle: { type: "string", title: "Tytuł elementu" },
                    contentPath: {
                      type: "string",
                      title: "Ścieżka zawartości",
                    },
                  },
                },
              },
            }}
            formData={{ saveToDB: node.saveToDB || {} }}
            onChange={(data) => onUpdate({ saveToDB: data.saveToDB })}
          />
        );

      case "json":
        return <JsonEditor value={node} onChange={onUpdate} />;

      default:
        return null;
    }
  };

  return (
    <EditorCard
      title={`${node.label || node.slug}`}
      description="Krok scenariusza"
    >
      <EditorTabs
        activeTab={activeTab}
        options={[
          { id: "basic", label: "Podstawowe" },
          { id: "attrs", label: "Atrybuty" },
          { id: "schema", label: "Schema" },
          { id: "json", label: "JSON" },
        ]}
        onChange={(t) => setActiveTab(t as any)}
      />
      <div className="p-4">{renderForm()}</div>
    </EditorCard>
  );
};

export default NodeEditor;
