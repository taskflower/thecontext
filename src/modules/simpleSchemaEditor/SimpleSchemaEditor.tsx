// src/modules/simpleSchemaEditor/SimpleSchemaEditor.tsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Database, Settings, Trash2 } from 'lucide-react';
import { EditableSchemaField } from './components/EditableSchemaField';
import { AddSchemaForm } from './components/AddSchemaForm';
import { ContextSchema, SchemaField } from './types';

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
  workspaceName
}) => {
  const [localSchema, setLocalSchema] = useState(schema);
  const [showAddSchema, setShowAddSchema] = useState(false);

  useEffect(() => {
    setLocalSchema(schema);
  }, [schema]);

  const handleSchemaUpdate = (newSchema: ContextSchema) => {
    setLocalSchema(newSchema);
    onSchemaChange(newSchema);
  };

  const addNewSchema = (name: string) => {
    const newSchema = {
      ...localSchema,
      [name]: {
        type: 'object' as const,
        properties: {},
        required: []
      }
    };
    handleSchemaUpdate(newSchema);
    setShowAddSchema(false);
  };

  const removeSchema = (schemaName: string) => {
    const { [schemaName]: removed, ...rest } = localSchema;
    handleSchemaUpdate(rest);
  };

  const updateSchemaField = (schemaName: string, fieldName: string, fieldData: SchemaField) => {
    const targetSchema = localSchema[schemaName];
    if (!targetSchema) return;

    const newSchema = {
      ...localSchema,
      [schemaName]: {
        ...targetSchema,
        properties: {
          ...targetSchema.properties,
          [fieldName]: fieldData
        }
      }
    };
    handleSchemaUpdate(newSchema);
  };

  const removeSchemaField = (schemaName: string, fieldName: string) => {
    const targetSchema = localSchema[schemaName];
    if (!targetSchema) return;

    const { [fieldName]: removed, ...restProperties } = targetSchema.properties;
    const newSchema = {
      ...localSchema,
      [schemaName]: {
        ...targetSchema,
        properties: restProperties
      }
    };
    handleSchemaUpdate(newSchema);
  };

  const addSchemaField = (schemaName: string) => {
    const targetSchema = localSchema[schemaName];
    if (!targetSchema) return;

    const fieldCount = Object.keys(targetSchema.properties).length;
    const newFieldName = `pole${fieldCount + 1}`;
    
    const newField: SchemaField = {
      type: 'string',
      label: `Pole ${fieldCount + 1}`,
      fieldType: 'text'
    };

    updateSchemaField(schemaName, newFieldName, newField);
  };

  const renameSchemaField = (schemaName: string, oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    const targetSchema = localSchema[schemaName];
    if (!targetSchema || !targetSchema.properties[oldName]) return;

    const fieldData = targetSchema.properties[oldName];
    const { [oldName]: removed, ...restProperties } = targetSchema.properties;
    
    const newSchema = {
      ...localSchema,
      [schemaName]: {
        ...targetSchema,
        properties: {
          ...restProperties,
          [newName]: fieldData
        }
      }
    };
    handleSchemaUpdate(newSchema);
  };

  return (
    <>
     
      
      {/* Card */}
      <div className="fixed right-4 top-6 z-50 w-[500px] bg-white rounded-md shadow-lg border border-zinc-200 h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
              <Database size={14} />
              {title}
            </h3>
            {workspaceName && (
              <p className="text-xs text-zinc-500 truncate">
                {workspaceName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddSchema(true)}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              Schema
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {showAddSchema && (
            <AddSchemaForm 
              onAdd={addNewSchema}
              onCancel={() => setShowAddSchema(false)}
            />
          )}

          {Object.keys(localSchema).length === 0 && !showAddSchema && (
            <div className="text-center py-12">
              <Database size={24} className="mx-auto text-zinc-400 mb-2" />
              <div className="text-sm font-medium text-zinc-600 mb-1">Brak schematów</div>
              <div className="text-xs text-zinc-500 mb-3">
                Dodaj pierwszy schemat, aby rozpocząć
              </div>
              <button
                onClick={() => setShowAddSchema(true)}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1 mx-auto"
              >
                <Plus size={12} />
                Dodaj schemat
              </button>
            </div>
          )}

          <div className="space-y-3">
            {Object.entries(localSchema).map(([schemaName, schemaData]) => (
              <div key={schemaName} className="border border-zinc-200 rounded-md overflow-hidden bg-white">
                {/* Schema Header */}
                <div className="bg-zinc-50 px-3 py-2 border-b border-zinc-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Settings size={12} className="text-zinc-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={schemaName}
                        onChange={(e) => {
                          const newName = e.target.value;
                          if (newName !== schemaName) {
                            const { [schemaName]: data, ...rest } = localSchema;
                            const newSchema = { ...rest, [newName]: data };
                            handleSchemaUpdate(newSchema);
                          }
                        }}
                        className="text-sm font-medium text-zinc-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 py-0.5 min-w-0 flex-1"
                      />
                      <span className="text-xs text-zinc-500 bg-white px-1.5 py-0.5 rounded flex-shrink-0">
                        {Object.keys(schemaData.properties || {}).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => addSchemaField(schemaName)}
                        className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-0.5"
                      >
                        <Plus size={10} />
                        Pole
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Usunąć schemat "${schemaName}"?`)) {
                            removeSchema(schemaName);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Usuń schemat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schema Fields */}
                <div className="p-2">
                  {Object.keys(schemaData.properties || {}).length === 0 ? (
                    <div className="text-center py-6 text-zinc-400">
                      <div className="text-xs mb-2">Brak pól w tym schemacie</div>
                      <button
                        onClick={() => addSchemaField(schemaName)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Plus size={10} />
                        Dodaj pole
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(schemaData.properties || {}).map(([fieldName, fieldData]) => (
                        <EditableSchemaField
                          key={fieldName}
                          fieldName={fieldName}
                          fieldData={fieldData}
                          onUpdate={(updatedField) => updateSchemaField(schemaName, fieldName, updatedField)}
                          onRemove={() => removeSchemaField(schemaName, fieldName)}
                          onRename={(newName) => renameSchemaField(schemaName, fieldName, newName)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-zinc-200 bg-zinc-50">
          <div className="flex justify-between items-center text-xs text-zinc-500">
            <span>
              {Object.keys(localSchema).length} schematów • {Object.values(localSchema).reduce((acc, schema) => acc + Object.keys(schema.properties || {}).length, 0)} pól
            </span>
            <span>
              Auto-save
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleSchemaEditor;