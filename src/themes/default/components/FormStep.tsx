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
}) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    fieldSchemas,
    hasRequiredFields,
  } = useFormSchema({
    schema,
    jsonSchema,
    initialData: data,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("EnhancedFormStep - fieldSchemas:", fieldSchemas);
    }
  }, [fieldSchemas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (fieldName: string) => {
    const fieldSchema = fieldSchemas[fieldName];
    if (!fieldSchema) return null;

    const { fieldType, title, required, description, options } = fieldSchema;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];
    const hasError = !!fieldError;

    return (
      <div key={fieldName} className="my-4 space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          {title} {required && <span className="text-red-500">*</span>}
        </label>  

        {description && <p className="text-sm text-gray-500">{description}</p>}

        {fieldType === "text" && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="text"
              value={fieldValue || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.placeholder}
              className="flex h-10 w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
            />
          </div>
        )}

        {fieldType === "number" && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="number"
              value={fieldValue === undefined ? "" : fieldValue}
              min={fieldSchema.min}
              max={fieldSchema.max}
              step={fieldSchema.step}
              onChange={(e) =>
                handleChange(
                  fieldName,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder={fieldSchema.placeholder}
              className="flex h-10 w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
            />
          </div>
        )}

        {fieldType === "checkbox" && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {fieldSchema.placeholder || "Zaznacz"}
            </span>
          </div>
        )}

        {fieldType === "email" && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 px-3 text-sm rounded-l bg-gray-50 text-gray-500 border-r border-gray-200">
                @
              </div>
              <input
                type="email"
                value={fieldValue || ""}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={fieldSchema.placeholder || "email@example.com"}
                className="flex h-10 w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
              />
            </div>
          </div>
        )}

        {fieldType === "date" && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="date"
              value={fieldValue || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="flex h-10 w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
            />
          </div>
        )}

        {fieldType === "textarea" && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <textarea
              value={fieldValue || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.placeholder}
              rows={4}
              className="w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
            />
          </div>
        )}

        {fieldType === "select" && options && (
          <div className="relative w-full border rounded border-gray-200 hover:border-gray-300 focus-within:border-gray-400">
            <select
              value={fieldValue || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="flex h-10 w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
            >
              <option value="">-- Wybierz --</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasError && <p className="text-red-500 text-xs">{fieldError}</p>}
      </div>
    );
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>

      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).map(renderField)}

        {Object.keys(fieldSchemas).length === 0 && (
          <div className="p-4 bg-amber-50 text-amber-700 rounded border border-amber-200 text-sm">
            <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
          </div>
        )}

        {showRequiredHint && hasRequiredFields && (
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        )}

        {errors._form && (
          <div className="my-4 p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
            <p>{errors._form}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="px-5 py-2.5 rounded transition-colors text-sm font-semibold w-full bg-black text-white hover:bg-gray-800"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;