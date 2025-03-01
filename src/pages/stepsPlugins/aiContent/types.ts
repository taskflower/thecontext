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