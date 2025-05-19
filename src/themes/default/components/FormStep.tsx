// src/themes/default/components/FormStep.tsx
import React, { useMemo } from "react";
import { TemplateComponentProps, useFormSchema } from "@/core";
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
  // Dodajemy tylko ścieżkę do konkretnego fragmentu schematu
  schemaPath?: string;
}

const FormStep: React.FC<EnhancedFormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  nodeSlug,
  schemaPath,
  contextSchemaPath,
}) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { config } = useConfig();
  
  // Pobieranie schematu z konfiguracji workspace na podstawie ścieżki
  const derivedJsonSchema = useMemo(() => {
    if (jsonSchema) return jsonSchema; // Jeśli jsonSchema jest już zdefiniowane, użyj go
    
    // Znalezienie aktualnego workspace
    const workspace = config.workspaces.find(ws => ws.slug === workspaceSlug);
    if (!workspace) return {};
    
    // Użyj contextSchemaPath (z definicji węzła) lub schemaPath (z atrybutów)
    const path = contextSchemaPath || schemaPath;
    if (!path) return {};
    
    // Pobierz schemat z workspace.contextSchema.properties
    return workspace.contextSchema.properties[path] || {};
  }, [config.workspaces, workspaceSlug, jsonSchema, contextSchemaPath, schemaPath]);
  
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
  } = useFormSchema({ 
    schema, 
    jsonSchema: derivedJsonSchema, 
    initialData: data 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(`[FormStep:${nodeSlug}] Submitting form data:`, formData);
      onSubmit(formData);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}
      <form onSubmit={handleSubmit}>
        {Object.entries(fieldSchemas).map(([name, schema]) => (
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
        ))}
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