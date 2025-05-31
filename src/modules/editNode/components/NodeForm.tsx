// src/modules/editNode/components/NodeForm.tsx
import React from 'react';
import { FieldWidget } from "@/themes/default/widgets/form/FieldWidget";

interface NodeFormProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (key: string, value: any) => void;
}

const nodeFormSchema = {
  path: {
    type: "string",
    label: "Ścieżka",
    fieldType: "text",
    required: false,
    description: "Lokalizacja kroku w systemie"
  },
  slug: {
    type: "string",
    label: "Slug",
    fieldType: "text",
    required: true,
    description: "Identyfikator kroku (nie można zmieniać)"
  },
  label: {
    type: "string",
    label: "Label",
    fieldType: "text",
    required: true,
    description: "Wyświetlana nazwa kroku"
  },
  order: {
    type: "number",
    label: "Kolejność (order)",
    fieldType: "number",
    required: true,
    minimum: 1,
    maximum: 99,
    description: "Określa kolejność wykonywania kroków w scenariuszu"
  },
  tplFile: {
    type: "string",
    label: "Template File",
    fieldType: "select",
    required: true,
    enum: [
      "FormStep",
      "ListTableStep", 
      "DbSummaryStep",
      "LLMGenerationStep",
      "UserLoginProcessStep",
      "InfoStep",
      "ConfirmationStep"
    ],
    enumLabels: {
      "FormStep": "FormStep - Formularz",
      "ListTableStep": "ListTableStep - Lista/Tabela", 
      "DbSummaryStep": "DbSummaryStep - Podsumowanie",
      "LLMGenerationStep": "LLMGenerationStep - AI Generator",
      "UserLoginProcessStep": "UserLoginProcessStep - Logowanie",
      "InfoStep": "InfoStep - Informacje",
      "ConfirmationStep": "ConfirmationStep - Potwierdzenie"
    },
    description: "Komponent template używany do renderowania tego kroku"
  }
} as const;

export const NodeForm: React.FC<NodeFormProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  return (
    <div className="space-y-4">
      {/* Path field (read-only) */}
      <div>
        <FieldWidget
          field={{ ...nodeFormSchema.path, key: "path" }}
          value={formData.path || ""}
          onChange={() => {}}
        />
        <div className="mt-1">
          <div className="text-sm text-zinc-600 bg-zinc-50 p-2 rounded">
            {formData.path}
          </div>
        </div>
      </div>

      {/* Slug field (read-only) */}
      <div>
        <FieldWidget
          field={{ ...nodeFormSchema.slug, key: "slug" }}
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

      {/* Label field (editable) */}
      <div>
        <FieldWidget
          field={{
            ...nodeFormSchema.label,
            key: "label",
            error: errors.label,
          }}
          value={formData.label || ""}
          onChange={onFieldChange}
        />
      </div>

      {/* Order field (editable) */}
      <div>
        <FieldWidget
          field={{
            ...nodeFormSchema.order,
            key: "order",
            error: errors.order,
          }}
          value={formData.order || ""}
          onChange={onFieldChange}
        />
      </div>

      {/* Template file field (editable) */}
      <div>
        <FieldWidget
          field={{
            ...nodeFormSchema.tplFile,
            key: "tplFile",
            error: errors.tplFile,
          }}
          value={formData.tplFile || ""}
          onChange={onFieldChange}
        />
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-700 text-sm">
          <strong>Popularne templates:</strong><br />
          <span className="text-xs">
            FormStep (formularze), ListTableStep (listy), DbSummaryStep (podsumowania), LLMGenerationStep (AI)
          </span>
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
