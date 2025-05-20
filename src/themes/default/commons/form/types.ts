// src/themes/default/commons/form/fields/types.ts
import { FormikProps } from 'formik';

export interface FieldSchema {
  fieldType: string;
  title: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  isArray?: boolean;
}

export interface BaseFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  fieldId: string;
}

export interface FieldComponentProps {
  Component: React.ComponentType<BaseFieldProps>;
  fieldTypes: string[];
}
