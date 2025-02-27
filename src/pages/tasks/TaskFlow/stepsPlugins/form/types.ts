/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/plugins/form/types.ts
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormConfig {
  fields: FormField[];
  title?: string;
  description?: string;
  submitLabel?: string;
}

export interface FormPluginOptions {
  allowMultiple?: boolean;
  savePartial?: boolean;
  autoSubmitDelay?: number;
}