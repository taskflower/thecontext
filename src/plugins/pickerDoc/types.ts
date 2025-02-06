
// src/plugins/pickerDoc/types.ts
export interface PickerDocConfig {
  systemLLMMessage?: string;
}

export interface PickerDocRuntimeData {
  selectedDocuments: Array<{
    id: string;
    content: string;
  }>;
}
