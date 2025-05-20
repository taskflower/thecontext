// src/themes/default/commons/form/types.ts - maksymalnie elastyczne
import { FormikProps } from 'formik';

// Elastyczny interfejs dla schematu pola (otwarty na rozszerzenia)
export interface FieldSchema {
  // Podstawowe właściwości
  type?: string;
  title?: string;
  description?: string;
  required?: boolean;
  
  // Typ pola - bezpośrednio odpowiada nazwie komponentu
  fieldType?: string;
  widget?: string;
  
  // Różne opcje wyświetlania i zachowania
  placeholder?: string;
  help?: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  patternMessage?: string;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  
  // Otwarte na rozszerzenia - może zawierać dowolne dodatkowe właściwości
  [key: string]: any;
}

// Wspólny interfejs dla komponentów pól formularza
export interface BaseFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  fieldId: string;
}