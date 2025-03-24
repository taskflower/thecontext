// src/modules/context/types.ts


export type ContextValueType = 'text' | 'json';

export interface ContextItem {
  key: string;
  value: string; // Może zawierać zarówno tekst jak i serializowany JSON
  valueType: ContextValueType;
}

