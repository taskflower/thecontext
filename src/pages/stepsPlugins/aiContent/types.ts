// src/pages/stepsPlugins/aiContent/types.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AiContentConfig {
  title: string;
  description: string;
  promptTemplate: string;
  systemPrompt: string;
  outputFormat: 'markdown' | 'html' | 'plaintext' | 'json';
  maxTokens: number;
  storeAsDocument: boolean;
  allowRetry: boolean;
  model?: string;
  responseAction?: {
    type: 'direct' | 'create_entities' | 'custom';
    entityMappings?: Array<{
      entityType: string;
      sourcePath: string;
      fieldMapping: Record<string, string>;
    }>;
    customHandler?: string;
    customConfig?: Record<string, any>;
  };
}

export interface AiContentResult {
  content: string;
  format: string;
  generatedAt: string;
  charCount: number;
}

export interface AiDocumentItem {
  id: string;
  title: string;
  content: string;
  metaKeys: string[];
  schema: Record<string, any>;
  folderId: string;
  createdAt: string;
  updatedAt: string;
}