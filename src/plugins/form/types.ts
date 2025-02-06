// src/plugins/form/types.ts

export interface FormConfig {
  question: string;
  required?: boolean;
  minLength?: number;
  systemLLMMessage?: string; // zmieniono z stepDescription
}

export interface FormRuntimeData {
  answer: string;
  isConfirmed: boolean;
}