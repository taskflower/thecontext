// src/core/components/FormikField.tsx
import React from 'react';
import { FormikProps } from 'formik';
import { FieldSchema } from '@/themes/default/commons/form/types';
import { getFieldRegistry } from './fieldRegistry';

interface Props {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
}

const FormikField: React.FC<Props> = ({ name, formik, fieldSchema, nodeSlug }) => {
  const { title, required, description, type = 'text', fieldType } = fieldSchema;
  const registry = getFieldRegistry();
  const key = fieldType || type;
  const FieldComponent = registry[key] || registry.string;

  const fieldId = `field-${nodeSlug}-${name}`;
  const error = formik.touched[name] && formik.errors[name];

  return (
    <div className="my-4 space-y-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
        {title}{required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <FieldComponent
        name={name}
        formik={formik}
        fieldSchema={fieldSchema}
        fieldId={fieldId}
      />
      {error && <p className="text-red-500 text-xs mt-1">{String(error)}</p>}
    </div>
  );
};

export default FormikField;