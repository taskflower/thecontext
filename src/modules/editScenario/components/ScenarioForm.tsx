// src/modules/editScenario/components/ScenarioForm.tsx
import React from 'react';
import { FieldWidget } from "@/themes/default/widgets/form/FieldWidget";

interface ScenarioFormProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (key: string, value: any) => void;
}

const scenarioFormSchema = {
  workspaceName: {
    type: "string",
    label: "Workspace",
    fieldType: "text",
    required: false,
    description: "Workspace zawierający ten scenariusz"
  },
  slug: {
    type: "string",
    label: "Slug",
    fieldType: "text",
    required: true,
    description: "Identyfikator scenariusza (nie można zmieniać)"
  },
  name: {
    type: "string",
    label: "Nazwa scenariusza",
    fieldType: "text",
    required: true,
    description: "Wyświetlana nazwa scenariusza"
  },
  nodeCount: {
    type: "number",
    label: "Liczba kroków",
    fieldType: "number",
    required: false,
    description: "Liczba kroków w scenariuszu"
  }
} as const;

export const ScenarioForm: React.FC<ScenarioFormProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  return (
    <div className="space-y-4">
      {/* Read-only workspace field */}
      <div>
        <FieldWidget
          field={{ ...scenarioFormSchema.workspaceName, key: "workspaceName" }}
          value={formData.workspaceName || ""}
          onChange={() => {}}
        />
        <input
          type="text"
          value={formData.workspaceName || ""}
          disabled
          className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
        />
      </div>

      {/* Read-only slug field */}
      <div>
        <FieldWidget
          field={{ ...scenarioFormSchema.slug, key: "slug" }}
          value={formData.slug || ""}
          onChange={() => {}}
        />
        <input
          type="text"
          value={formData.slug || ""}
          disabled
          className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
        />
        <p className="text-xs text-zinc-500 mt-1">Slug nie może być zmieniany</p>
      </div>

      {/* Editable name field */}
      <div>
        <FieldWidget
          field={{
            ...scenarioFormSchema.name,
            key: "name",
            error: errors.name,
          }}
          value={formData.name || ""}
          onChange={onFieldChange}
        />
      </div>

      {/* Read-only node count */}
      <div>
        <FieldWidget
          field={{ ...scenarioFormSchema.nodeCount, key: "nodeCount" }}
          value={formData.nodeCount || 0}
          onChange={() => {}}
        />
        <input
          type="number"
          value={formData.nodeCount || 0}
          disabled
          className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-zinc-100 text-zinc-500"
        />
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-700 text-sm">
          <strong>Info:</strong> Nazwa zostanie również zaktualizowana w pierwszym kroku scenariusza.
        </p>
      </div>

      {/* Error display */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );
};
