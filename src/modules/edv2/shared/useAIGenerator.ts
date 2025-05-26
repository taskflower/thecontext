// ========================================
// src/modules/edv2/shared/useAIGenerator.ts
// ========================================
import { useState } from 'react';
import { useLlmEngine } from '@/core/engine';
import { AI_CONFIGS } from './editorConfigs';

export function useAIGenerator(type: keyof typeof AI_CONFIGS) {
  const [prompt, setPrompt] = useState('');
  const config = AI_CONFIGS[type];

  const { isLoading, result, start } = useLlmEngine({
    schema: config.schema,
    jsonSchema: config.jsonSchema,
    userMessage: prompt,
    systemMessage: config.systemMessage
  });

  const generate = () => {
    if (prompt.trim()) {
      start();
    }
  };

  return {
    prompt,
    setPrompt,
    isLoading,
    result,
    generate,
    config
  };
}