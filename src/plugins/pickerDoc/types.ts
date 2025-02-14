

export interface PickerDocConfig {
  systemLLMMessage?: string;
  containerId?: string;
}

export interface PickerDocRuntimeData {
  selectedDocuments: Array<{
    id: string;
    content: string;
  }>;
}