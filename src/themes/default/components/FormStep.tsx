// src/themes/default/components/FormStep.tsx
import React from "react";
import { TemplateComponentProps, useFormSchema, unwrapSimpleValue, validateWithJsonSchema } from "@/core";
import FormikField from "../commons/form/FormikField";
import Loader from "../commons/Loader";
import { useFormik } from "formik";

interface FormStepProps extends TemplateComponentProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  contextSchemaPath?: string;
  contextDataPath?: string;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
  autoValidate?: boolean;
}

const FormStep: React.FC<FormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = "Formularz",
  description,
  submitLabel = "Dalej",
  contextSchemaPath,
  contextDataPath,
  nodeSlug,
  customFields,
  autoValidate = false,
}) => {
  // Ujednolicone użycie hooka useFormSchema
  const {
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
    isLoading,
    processedData
  } = useFormSchema({
    schema,
    jsonSchema,
    initialData: data,
    autoValidate,
    contextSchemaPath,
    contextDataPath
  });

  const formik = useFormik({
    initialValues: processedData || {},
    validate: (values) => validateWithJsonSchema(values, jsonSchema, isSimpleType),
    onSubmit: (values) => {
      const errors = validateWithJsonSchema(values, jsonSchema, isSimpleType);
      
      if (Object.keys(errors).length === 0) {
        const submitData = isSimpleType ? unwrapSimpleValue(values) : values;
        onSubmit(submitData);
      }
    },
    validateOnChange: autoValidate,
    validateOnBlur: autoValidate,
    enableReinitialize: true,
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {/* Podsumowanie walidacji */}
      {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded mb-4">
          <p className="font-medium mb-2">Formularz zawiera błędy:</p>
          <ul className="text-sm list-disc pl-5">
            {Object.entries(formik.errors).map(([field, error]) => (
              <li key={field}>
                {fieldSchemas[field]?.title || field}:{" "}
                <span className="text-red-500">{String(error)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        {Object.keys(fieldSchemas).length > 0 ? (
          Object.entries(fieldSchemas).map(([name, schema]) => (
            <FormikField
              key={name}
              name={name}
              formik={formik}
              fieldSchema={schema as any}
              nodeSlug={nodeSlug}
              customFields={customFields}
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