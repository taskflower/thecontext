// ========================================
// src/modules/edv2/shared/SchemaEditor.tsx - Z DEBUGOWANIEM
// ========================================
import { useState, useEffect } from "react";
import { AIGeneratorSection } from "./AIGeneratorSection";
import { createDefaultSchema } from "./editorUtils";

interface SchemaEditorProps {
  schema: any;
  onChange: (schema: any) => void;
}

export function SchemaEditor({ schema, onChange }: SchemaEditorProps) {
  const [newSchemaKey, setNewSchemaKey] = useState("");
  const [expandedSchemas, setExpandedSchemas] = useState<
    Record<string, boolean>
  >({});
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Debug logging
  useEffect(() => {
    if (schema) {
      const info = [];
      info.push(`Schema keys: ${Object.keys(schema).length}`);

      Object.entries(schema).forEach(([key, schemaObj]: [string, any]) => {
        info.push(`\n📄 ${key}:`);
        info.push(`  - type: ${schemaObj?.type || "undefined"}`);
        info.push(
          `  - properties: ${
            schemaObj?.properties ? Object.keys(schemaObj.properties).length : 0
          } fields`
        );

        if (schemaObj?.properties) {
          Object.keys(schemaObj.properties).forEach((propKey) => {
            const prop = schemaObj.properties[propKey];
            info.push(
              `    • ${propKey}: ${prop?.type || "no-type"} (${
                prop?.fieldType || "no-fieldType"
              })`
            );
          });
        }
      });

      setDebugInfo(info.join("\n"));
    } else {
      setDebugInfo("Schema is null/undefined");
    }
  }, [schema]);

  const addSchema = () => {
    if (!newSchemaKey.trim()) return;
    onChange({ ...schema, ...createDefaultSchema(newSchemaKey) });
    setNewSchemaKey("");
  };

  const removeSchema = (key: string) => {
    const newSchema = { ...schema };
    delete newSchema[key];
    onChange(newSchema);
  };

  const toggleExpanded = (schemaKey: string) => {
    setExpandedSchemas((prev) => ({
      ...prev,
      [schemaKey]: !prev[schemaKey],
    }));
  };

  // Show debug info if no schema or empty schema
  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800">⚠️ Debug Info</h4>
          <pre className="text-xs text-yellow-700 mt-2 whitespace-pre-wrap">
            {debugInfo}
          </pre>
        </div>

        <AIGeneratorSection
          type="schema"
          onApply={(result) => onChange(result.schemas)}
          bgColor="bg-green-50"
        />

        <div className="flex gap-2">
          <input
            value={newSchemaKey}
            onChange={(e) => setNewSchemaKey(e.target.value)}
            placeholder="Schema name"
            className="flex-1 text-sm border rounded px-2 py-1"
          />
          <button
            onClick={addSchema}
            disabled={!newSchemaKey.trim()}
            className="text-xs bg-zinc-900 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="text-center py-8 text-zinc-500">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-sm">No schemas found</div>
          <div className="text-xs">Check debug info above</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug panel - removable in production */}
      <details className="bg-gray-50 border rounded p-2">
        <summary className="text-xs font-medium cursor-pointer">
          🔍 Debug Schema Data
        </summary>
        <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap overflow-auto max-h-32">
          {debugInfo}
        </pre>
      </details>

      <AIGeneratorSection
        type="schema"
        onApply={(result) => onChange({ ...schema, ...result.schemas })}
        bgColor="bg-green-50"
      />

      <div className="flex gap-2">
        <input
          value={newSchemaKey}
          onChange={(e) => setNewSchemaKey(e.target.value)}
          placeholder="Schema name"
          className="flex-1 text-sm border rounded px-2 py-1"
        />
        <button
          onClick={addSchema}
          disabled={!newSchemaKey.trim()}
          className="text-xs bg-zinc-900 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(schema).map(([key, schemaObj]: [string, any]) => {
          const isExpanded = expandedSchemas[key];
          const properties = schemaObj?.properties || {};
          const propertyKeys = Object.keys(properties);

          return (
            <div key={key} className="border rounded">
              <div
                className="p-3 bg-zinc-50 cursor-pointer"
                onClick={() => toggleExpanded(key)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`transform transition-transform text-xs ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                    <span className="text-sm font-medium">📄 {key}</span>
                    <span className="text-xs bg-zinc-200 px-2 py-1 rounded">
                      {propertyKeys.length} fields
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSchema(key);
                    }}
                    className="text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  Fields: {propertyKeys.join(", ") || "None"}
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 border-t border-zinc-200 bg-white">
                  <div className="text-sm font-medium mb-2">Properties:</div>
                  <div className="space-y-2">
                    {propertyKeys.map((propKey) => {
                      const prop = properties[propKey];
                      return (
                        <div
                          key={propKey}
                          className="text-xs bg-zinc-50 p-2 rounded"
                        >
                          <div className="font-mono font-medium">{propKey}</div>
                          <div className="text-zinc-600 mt-1">
                            Type: {prop?.type || "undefined"} | Field:{" "}
                            {prop?.fieldType || "undefined"} | Label:{" "}
                            {prop?.label || "undefined"} | Required:{" "}
                            {prop?.required ? "Yes" : "No"}
                          </div>
                          {prop?.enum && (
                            <div className="text-zinc-600 mt-1">
                              Options: {prop.enum.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
