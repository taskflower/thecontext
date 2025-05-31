// src/modules/simpleSchemaEditor/SimpleSchemaEditor.tsx - DRASTYCZNIE SKRÓCONY
import React, { useState, useEffect } from "react";
import { Plus, Database, Settings, Trash2 } from "lucide-react";
import { EditableSchemaField } from "./components/EditableSchemaField";
import { ContextSchema } from "./types";
import { BaseModal } from "../shared/components/BaseModal";
import { FormField } from "../shared/components/FormField";

interface SimpleSchemaEditorProps {
  schema: ContextSchema;
  onSchemaChange: (schema: ContextSchema) => void;
  onClose: () => void;
  title?: string;
  workspaceName?: string;
}

const SimpleSchemaEditor: React.FC<SimpleSchemaEditorProps> = ({
  schema,
  onSchemaChange,
  onClose,
  title = "Schema Editor",
  workspaceName,
}) => {
  const [localSchema, setLocalSchema] = useState(schema);
  const [showAddSchema, setShowAddSchema] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState("");

  useEffect(() => setLocalSchema(schema), [schema]);

  const handleSchemaUpdate = (newSchema: ContextSchema) => {
    setLocalSchema(newSchema);
    onSchemaChange(newSchema);
  };

  const addNewSchema = () => {
    if (!newSchemaName.trim()) return;
    handleSchemaUpdate({
      ...localSchema,
      [newSchemaName.trim()]: { type: "object", properties: {}, required: [] },
    });
    setNewSchemaName("");
    setShowAddSchema(false);
  };

  const actions = (
    <div className="flex justify-between items-center text-xs text-zinc-500">
      <span>
        {Object.keys(localSchema).length} schematów •{" "}
        {Object.values(localSchema).reduce(
          (acc, schema) => acc + Object.keys(schema.properties || {}).length,
          0
        )}{" "}
        pól
      </span>
      <span>Auto-save</span>
    </div>
  );

  return (
    <BaseModal
      title={title}
      subtitle={workspaceName}
      icon={<Database size={14} />}
      onClose={onClose}
      actions={actions}
     
    >
      {showAddSchema && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-green-800">Add Schema</h4>
            <button
              onClick={() => setShowAddSchema(false)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2">
            <FormField
              label=""
              value={newSchemaName}
              onChange={setNewSchemaName}
              placeholder="Schema name..."
            />
            <button
              onClick={addNewSchema}
              disabled={!newSchemaName.trim()}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-zinc-200"
            >
              <Plus size={10} /> Create
            </button>
          </div>
        </div>
      )}

      {Object.keys(localSchema).length === 0 && !showAddSchema ? (
        <div className="text-center py-12">
          <Database size={24} className="mx-auto text-zinc-400 mb-2" />
          <div className="text-sm font-medium text-zinc-600 mb-3">
            No schemas
          </div>
          <button
            onClick={() => setShowAddSchema(true)}
            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded"
          >
            <Plus size={12} /> Add Schema
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {!showAddSchema && (
            <button
              onClick={() => setShowAddSchema(true)}
              className="w-full p-2 border-2 border-dashed border-zinc-300 rounded text-xs text-zinc-500 hover:bg-zinc-50"
            >
              + Add Schema
            </button>
          )}
          {Object.entries(localSchema).map(([schemaName, schemaData]) => (
            <div
              key={schemaName}
              className="border border-zinc-200 rounded-md overflow-hidden"
            >
              <div className="bg-zinc-50 px-3 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Settings size={12} className="text-zinc-500" />
                  <input
                    type="text"
                    value={schemaName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      if (newName !== schemaName) {
                        const { [schemaName]: data, ...rest } = localSchema;
                        handleSchemaUpdate({ ...rest, [newName]: data });
                      }
                    }}
                    className="text-sm font-medium bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 py-0.5 flex-1"
                  />
                  <span className="text-xs text-zinc-500 bg-white px-1.5 py-0.5 rounded">
                    {Object.keys(schemaData.properties || {}).length}
                  </span>
                </div>
                <button
                  onClick={() =>
                    confirm(`Delete "${schemaName}"?`) &&
                    handleSchemaUpdate(
                      (() => {
                        const { [schemaName]: removed, ...rest } = localSchema;
                        return rest;
                      })()
                    )
                  }
                  className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="p-2">
                {Object.keys(schemaData.properties || {}).length === 0 ? (
                  <div className="text-center py-6 text-zinc-400">
                    <button
                      onClick={() => {
                        const fieldCount = Object.keys(
                          schemaData.properties
                        ).length;
                        const newFieldName = `pole${fieldCount + 1}`;
                        handleSchemaUpdate({
                          ...localSchema,
                          [schemaName]: {
                            ...schemaData,
                            properties: {
                              ...schemaData.properties,
                              [newFieldName]: {
                                type: "string",
                                label: `Field ${fieldCount + 1}`,
                                fieldType: "text",
                              },
                            },
                          },
                        });
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      + Add Field
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(schemaData.properties || {}).map(
                      ([fieldName, fieldData]) => (
                        <EditableSchemaField
                          key={fieldName}
                          fieldName={fieldName}
                          fieldData={fieldData}
                          onUpdate={(updatedField) =>
                            handleSchemaUpdate({
                              ...localSchema,
                              [schemaName]: {
                                ...schemaData,
                                properties: {
                                  ...schemaData.properties,
                                  [fieldName]: updatedField,
                                },
                              },
                            })
                          }
                          onRemove={() => {
                            const { [fieldName]: removed, ...restProperties } =
                              schemaData.properties;
                            handleSchemaUpdate({
                              ...localSchema,
                              [schemaName]: {
                                ...schemaData,
                                properties: restProperties,
                              },
                            });
                          }}
                          onRename={(newName) => {
                            if (fieldName === newName) return;
                            const fieldDataCopy =
                              schemaData.properties[fieldName];
                            const { [fieldName]: removed, ...restProperties } =
                              schemaData.properties;
                            handleSchemaUpdate({
                              ...localSchema,
                              [schemaName]: {
                                ...schemaData,
                                properties: {
                                  ...restProperties,
                                  [newName]: fieldDataCopy,
                                },
                              },
                            });
                          }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseModal>
  );
};

export default SimpleSchemaEditor;
