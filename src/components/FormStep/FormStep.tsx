// src/core/components/FormStep.tsx
import React from 'react';
import {
  TemplateComponentProps,
  useFormSchema,
  unwrapSimpleValue,
  validateWithJsonSchema,
} from '@/core';
import { useFormik } from 'formik';

import FormikField from './FormikField';
import Loader from '@/themes/default/commons/Loader';

interface FormStepProps extends TemplateComponentProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  customFields?: Record<string, any>;
}

const FormStep: React.FC<FormStepProps> = ({
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = 'Formularz',
  description,
  submitLabel = 'Dalej',
  nodeSlug,
  contextSchemaPath,
  contextDataPath,
  autoValidate = false,
  customFields,
}) => {
  const {
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
    isLoading,
    processedData,
  } = useFormSchema({
    schema,
    jsonSchema,
    initialData: data,
    autoValidate,
    contextSchemaPath,
    contextDataPath,
  });

  // Zdecyduj, które pola renderować: jeśli zdefiniowano customFields, użyj ich kolejności
  const fieldNames = customFields
    ? Object.keys(customFields)
    : Object.keys(fieldSchemas);

  const formik = useFormik({
    initialValues: processedData || {},
    validate: (values) => {
      const errors: Record<string, string> = validateWithJsonSchema(
        values,
        jsonSchema,
        isSimpleType
      );
      // walidacja wymaganych pól w customFields
      if (customFields) {
        Object.entries(customFields).forEach(
          ([key, schema]: [string, any]) => {
            if (
              schema.required &&
              (values[key] === undefined || values[key] === null || values[key] === '')
            ) {
              errors[key] = 'To pole jest wymagane';
            }
          }
        );
      }
      return errors;
    },
    onSubmit: (values) => {
      const submitData = isSimpleType
        ? unwrapSimpleValue(values)
        : values;
      onSubmit(submitData);
    },
    validateOnChange: autoValidate,
    validateOnBlur: autoValidate,
    enableReinitialize: true,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="pt-6">
      <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {formik.submitCount > 0 &&
        Object.keys(formik.errors).length > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded mb-4">
            <p className="font-medium mb-2">Formularz zawiera błędy:</p>
            <ul className="text-sm list-disc pl-5">
              {Object.entries(formik.errors).map(([field, error]) => (
                <li key={field}>
                  {fieldSchemas[field]?.title || field}:{' '}
                  <span className="text-red-500">{String(error)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      <form onSubmit={formik.handleSubmit}>
        {fieldNames.map((name) => (
          <FormikField
            key={name}
            name={name}
            formik={formik}
            fieldSchema={
              fieldSchemas[name] || (customFields ?? {})[name]
            }
            nodeSlug={nodeSlug}
          />
        ))}

        {hasRequiredFields && !customFields && (
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