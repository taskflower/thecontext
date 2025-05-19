// src/themes/default/components/FormStep.tsx
import React, { useMemo } from "react";
import {
  TemplateComponentProps,
  useFormSchema,
  useFlow,
  getPath,
} from "@/core";
import FieldRenderer from "../commons/form/FieldRenderer";
import TagsField from "../commons/form/TagsField";
import CheckboxField from "../commons/form/CheckboxField";
import TextField from "../commons/form/TextField";
import NumberField from "../commons/form/NumberField";
import TextareaField from "../commons/form/TextareaField";
import SelectField from "../commons/form/SelectField";
import { useParams } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";

const fieldComponents = {
  TagsField,
  CheckboxField,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
};

interface EnhancedFormStepProps extends TemplateComponentProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  showRequiredHint?: boolean;
  context?: {
    workspace: any;
  };
}

const useSchemaFromContext = (contextSchemaPath: string) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { config } = useConfig();
  if (!config) return null;

  return useMemo(() => {
    if (!contextSchemaPath || !workspaceSlug) return null;

    const workspace = config.workspaces.find((ws) => ws.slug === workspaceSlug);
    if (!workspace) return null;

    // Podziel ścieżkę na segmenty
    const pathSegments = contextSchemaPath.split(".");
    if (pathSegments.length === 0) return null;

    // Pobierz główny schemat
    let schema = workspace.contextSchema;
    if (!schema || !schema.properties) return null;

    // Nawiguj do właściwego podschematu
    let currentSchema = schema.properties[pathSegments[0]];
    for (let i = 1; i < pathSegments.length; i++) {
      if (
        !currentSchema ||
        currentSchema.type !== "object" ||
        !currentSchema.properties ||
        !currentSchema.properties[pathSegments[i]]
      ) {
        return null;
      }
      currentSchema = currentSchema.properties[pathSegments[i]];
    }

    return currentSchema;
  }, [config, workspaceSlug, contextSchemaPath]);
};

const FormStep: React.FC<EnhancedFormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  nodeSlug,
  contextSchemaPath,
}) => {
  const contextSchema = useSchemaFromContext(contextSchemaPath);

  const effectiveSchema = useMemo(() => {
    if (jsonSchema) return jsonSchema;
    return contextSchema || {};
  }, [jsonSchema, contextSchema]);

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
    unwrapSimpleValue,
  } = useFormSchema({
    schema,
    jsonSchema: effectiveSchema,
    initialData: data,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(`[FormStep:${nodeSlug}] Submitting form data:`, formData);

      // Jeśli mamy prosty typ, odwijamy wartość przed przekazaniem
      const submitData = isSimpleType ? unwrapSimpleValue(formData) : formData;
      onSubmit(submitData);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).length > 0 ? (
          Object.entries(fieldSchemas).map(([name, schema]) => (
            <FieldRenderer
              key={name}
              name={name}
              fieldSchema={schema}
              value={formData[name]}
              error={errors[name]}
              handleChange={handleChange}
              nodeSlug={nodeSlug}
              components={fieldComponents}
            />
          ))
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-red-600">
              Nie znaleziono pól formularza dla podanej ścieżki.
            </p>
            <p className="text-red-500 text-sm">
              Sprawdź konfigurację ścieżki i strukturę schematu.
            </p>
          </div>
        )}

        {hasRequiredFields && (
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        )}
        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-black text-white rounded text-sm font-semibold hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
};

export default FormStep;
