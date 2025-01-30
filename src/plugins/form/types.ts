// src/plugins/form/types.ts

export interface FormConfig {
  question: string;
  required?: boolean;
  minLength?: number;
}

export interface FormRuntimeData {
  answer: string;
  isConfirmed: boolean;
}