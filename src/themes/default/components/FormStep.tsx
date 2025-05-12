// src/themes/default/components/FormStep.tsx
import { TemplateComponentProps, useFormSchema } from "@/core";
import React, { useEffect } from "react";

interface EnhancedFormStepProps extends TemplateComponentProps {
  jsonSchema?: any;
  title?: string;
  description?: string;
  submitLabel?: string;
  showRequiredHint?: boolean;
}

const FormStep: React.FC<EnhancedFormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  showRequiredHint = true,
  nodeSlug, // Dodane, żeby wiedzieć, który node generuje błędy
}) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
  } = useFormSchema({ schema, jsonSchema, initialData: data });

  // Dodane szczegółowe logi diagnostyczne
  useEffect(() => {
    console.log(`[FormStep:${nodeSlug}] formData:`, formData);
    console.log(`[FormStep:${nodeSlug}] errors:`, errors);
    console.log(`[FormStep:${nodeSlug}] fieldSchemas:`, fieldSchemas);
    console.log(`[FormStep:${nodeSlug}] jsonSchema:`, jsonSchema);
    console.log(`[FormStep:${nodeSlug}] schema:`, schema);
  }, [formData, errors, fieldSchemas, jsonSchema, schema, nodeSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    console.log(`[FormStep:${nodeSlug}] Form validation result:`, isValid);
    console.log(`[FormStep:${nodeSlug}] Validation errors:`, errors);
    
    if (isValid) {
      console.log(`[FormStep:${nodeSlug}] Submitting form data:`, formData);
      onSubmit(formData);
    }
  };

  const renderField = (fieldName: string) => {
    const fieldSchema = fieldSchemas[fieldName];
    if (!fieldSchema) return null;

    const { fieldType, title, required, description, options } = fieldSchema;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];

    return (
      <div key={fieldName} className="my-4 space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}

        {fieldType === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => {
                console.log(`[FormStep:${nodeSlug}] Checkbox change:`, fieldName, e.target.checked);
                handleChange(fieldName, e.target.checked);
              }}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {fieldSchema.placeholder || "Zaznacz"}
            </span>
          </div>
        ) : fieldType === "text" || fieldType === "email" || fieldType === "date" ? (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type={fieldType}
              value={fieldValue || ""}
              onChange={(e) => {
                console.log(`[FormStep:${nodeSlug}] Input change:`, fieldName, e.target.value);
                handleChange(fieldName, e.target.value);
              }}
              placeholder={fieldSchema.placeholder}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        ) : fieldType === "number" ? (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="number"
              value={fieldValue === undefined ? "" : fieldValue}
              min={fieldSchema.min}
              max={fieldSchema.max}
              step={fieldSchema.step}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                console.log(`[FormStep:${nodeSlug}] Number input change:`, fieldName, val);
                handleChange(fieldName, val);
              }}
              placeholder={fieldSchema.placeholder}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        ) : fieldType === "textarea" ? (
          <textarea
            value={fieldValue || ""}
            onChange={(e) => {
              console.log(`[FormStep:${nodeSlug}] Textarea change:`, fieldName, e.target.value);
              handleChange(fieldName, e.target.value);
            }}
            placeholder={fieldSchema.placeholder}
            rows={4}
            className="w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus:outline-none text-sm"
          />
        ) : fieldType === "select" && options ? (
          <select
            value={fieldValue || ""}
            onChange={(e) => {
              console.log(`[FormStep:${nodeSlug}] Select change:`, fieldName, e.target.value);
              handleChange(fieldName, e.target.value);
            }}
            className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
          >
            <option value="">-- Wybierz --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : null}

        {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
      </div>
    );
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && <p className="text-gray-600 mb-6 text-sm">{description}</p>}
      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).map(renderField)}
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