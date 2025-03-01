// src/pages/stepsPlugins/aiContent/index.ts
import { register } from '../registry';
import AiContentEditor from './AiContentEditor';
import AiContentViewer from './AiContentViewer';
import AiContentResult from './AiContentResult';

register({
  type: 'ai-content',
  name: 'AI Content Generator',
  Viewer: AiContentViewer,
  Editor: AiContentEditor,
  ResultRenderer: AiContentResult,
  defaultConfig: {
    title: 'AI Content Generator',
    description: 'Generate content using AI assistance',
    promptTemplate: 'Generate content about the following topic: {{topic}}',
    systemPrompt: 'You are a helpful assistant specializing in creating professional content.',
    outputFormat: 'markdown',
    maxTokens: 1000,
    storeAsDocument: true,
    allowRetry: true,
    responseAction: {
      type: 'direct'
    }
  }
});