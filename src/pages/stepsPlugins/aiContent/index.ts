// src/pages/stepsPlugins/aiContent/index.ts
import { PLUGIN_CATEGORIES, register } from '../registry';
import AiContentEditor from './AiContentEditor';
import AiContentViewer from './AiContentViewer';
import AiContentResult from './AiContentResult';

// src/pages/stepsPlugins/aiContent/index.ts
register({
  type: 'ai-content',
  name: 'AI Assistant',
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Generate documents, emails, or reports using AI',
  Viewer: AiContentViewer,
  Editor: AiContentEditor,
  ResultRenderer: AiContentResult,
  defaultConfig: {
    title: 'Generate Report',
    description: 'Create a professional document using AI assistance',
    promptTemplate: 'Create a detailed report about {{topic}} including key findings, analysis, and recommendations.',
    systemPrompt: 'You are a professional business analyst specializing in creating clear, actionable reports.',
    outputFormat: 'markdown',
    maxTokens: 1000,
    storeAsDocument: true,
    allowRetry: true,
    responseAction: {
      type: 'direct'
    }
  }
});