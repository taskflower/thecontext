// src/plugins/pickerDoc/types.ts
// export interface PickerDocConfig {
//   // Empty for now as specified
// }

export interface PickerDocRuntimeData {
  selectedDocuments: Array<{
    id: string;
    content: string;
  }>;
}
