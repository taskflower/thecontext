// src/themes/default/components/FormStep.tsx
import React, { useMemo, useState } from "react";
import { TemplateComponentProps, useFormSchema } from "@/core";

import { useParams } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import {
  CheckboxField,
  FieldRenderer,
  NumberField,
  SelectField,
  TagsField,
  TextareaField,
  TextField,
} from "../commons/form";

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
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Debug log schema sources
  console.log(`[FormStep:${nodeSlug}] Schema Sources:`, {
    propSchema: schema,
    propJsonSchema: jsonSchema,
    contextSchemaPath,
    contextSchema,
  });

  const effectiveSchema = useMemo(() => {
    if (jsonSchema) return jsonSchema;
    return contextSchema || {};
  }, [jsonSchema, contextSchema]);

  // Debug log effective schema
  console.log(`[FormStep:${nodeSlug}] Effective Schema:`, effectiveSchema);

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
    unwrapSimpleValue,
    setErrors,
  } = useFormSchema({
    schema,
    jsonSchema: effectiveSchema,
    initialData: data,
  });

  // Debug current form state
  console.log(`[FormStep:${nodeSlug}] Current Form State:`, {
    formData,
    errors,
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[FormStep:${nodeSlug}] Attempting to submit form...`);

    // Manual validation for required fields if standard validation doesn't catch them
    const manualValidationErrors: Record<string, string> = {};

    // Check required fields explicitly from jsonSchema
    if (effectiveSchema.required) {
      effectiveSchema.required.forEach((fieldName: string) => {
        if (
          formData[fieldName] === undefined ||
          formData[fieldName] === null ||
          formData[fieldName] === ""
        ) {
          manualValidationErrors[fieldName] = "To pole jest wymagane";
        }
      });
    }

    // Apply manual validation errors if found
    if (Object.keys(manualValidationErrors).length > 0) {
      console.log(
        `[FormStep:${nodeSlug}] Manual validation failed with errors:`,
        manualValidationErrors
      );
      setErrors(manualValidationErrors);
      setShowValidationSummary(true);
      return;
    }

    // Run standard validation
    const isValid = validateForm();
    console.log(
      `[FormStep:${nodeSlug}] Form validation result:`,
      isValid,
      "Errors:",
      errors
    );

    if (isValid) {
      // Jeśli mamy prosty typ, odwijamy wartość przed przekazaniem
      const submitData = isSimpleType ? unwrapSimpleValue(formData) : formData;
      console.log(`[FormStep:${nodeSlug}] Submitting form data:`, submitData);
      onSubmit(submitData);
    } else {
      // Show validation summary when validation fails
      setShowValidationSummary(true);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {/* Validation summary - show when there are errors and validation has been attempted */}
      {showValidationSummary && Object.keys(errors).length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded mb-4">
          <p className="font-medium mb-2">Formularz zawiera błędy:</p>
          <ul className="text-sm list-disc pl-5">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                {fieldSchemas[field]?.title || field}: {error}
              </li>
            ))}
          </ul>
        </div>
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
              handleChange={(field, value) => {
                handleChange(field, value);
                // Clear error for this field when it changes
                if (errors[field]) {
                  const newErrors = { ...errors };
                  delete newErrors[field];
                  setErrors(newErrors);
                }
              }}
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
              Sprawdź konfigurację ścieżki: <strong>{contextSchemaPath}</strong>
            </p>
            <details className="mt-3">
              <summary className="text-red-600 cursor-pointer">
                Szczegóły debugowania
              </summary>
              <pre className="text-xs bg-red-100 p-2 mt-2 rounded overflow-auto max-h-40">
                {JSON.stringify(
                  {
                    contextSchemaPath,
                    effectiveSchema,
                    formData,
                    errors,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
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
