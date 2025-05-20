// src/themes/default/commons/form/FormikField.tsx (zmodyfikowany)
import React from 'react';
import { FormikProps } from 'formik';
import { CheckboxField, FieldSchema, NumberField, SelectField, TagsField, TextareaField, TextField } from '.';

interface FormikFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
}

const FormikField: React.FC<FormikFieldProps> = ({
  name,
  formik,
  fieldSchema,
  nodeSlug,
  customFields = {},
}) => {
  const { 
    title, 
    required, 
    description, 
    fieldType
  } = fieldSchema;
  
  const error = formik.touched[name] && formik.errors[name];
  const fieldId = `field-${nodeSlug}-${name}`;
  
  // Rejestr komponentów pól
  const fieldComponentsMap = {
    text: TextField,
    email: TextField,
    date: TextField,
    textarea: TextareaField,
    checkbox: CheckboxField,
    select: SelectField,
    number: NumberField,
    tags: TagsField,
    ...customFields,
  };
  
  // Wybór komponentu na podstawie typu pola
  const FieldComponent = fieldComponentsMap[fieldType as keyof typeof fieldComponentsMap] || TextField;
  
  return (
    <div className="my-4 space-y-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && <p className="text-sm text-gray-500">{description}</p>}
      
      <FieldComponent
        name={name}
        formik={formik}
        fieldSchema={fieldSchema}
        fieldId={fieldId}
      />
      
      {error && <p className="text-red-500 text-xs">{String(error)}</p>}
    </div>
  );
};

export default FormikField;