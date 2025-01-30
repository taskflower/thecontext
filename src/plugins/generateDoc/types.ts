// src/plugins/generateDoc/types.ts
export interface GenerateDocConfig {
  documentName: string;
  containerName: string;
}

export interface GenerateDocRuntimeData {
  messages: Array<{role: string; content: string}>;
  isGenerated: boolean;
  generatedContent?: string;
}