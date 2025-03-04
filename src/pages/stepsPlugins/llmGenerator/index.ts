// src/pages/stepsPlugins/llmGenerator/index.ts
import { register } from '../registry';

import { PLUGIN_CATEGORIES } from '../registry';
import { LLMGeneratorEditor } from './LLMGeneratorEditor';
import { LLMGeneratorResult } from './LLMGeneratorResult';
import { LLMGeneratorViewer } from './LLMGeneratorViewer';

register({
  type: 'llm-generator',
  name: 'LLM Content Generator',
  Viewer: LLMGeneratorViewer,
  Editor: LLMGeneratorEditor,
  ResultRenderer: LLMGeneratorResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Generate content using LLM based on prompts and context',
  defaultConfig: {
    title: 'Generate Content',
    description: 'Generate content using AI',
    systemPrompt: 'You are a helpful assistant that generates high quality content based on user requirements.',
    userPrompt: 'Please generate content about the following topic:',
    maxTokens: 2000,
    temperature: 0.7,
    saveAsDocument: true
  }
});