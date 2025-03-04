// index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { AppBuilderEditor } from './AppBuilderEditor';
import { AppBuilderResult } from './AppBuilderResult';
import { AppBuilderViewer } from './AppBuilderViewer';

register({
  type: 'app-builder',
  name: 'Application Builder',
  Viewer: AppBuilderViewer,
  Editor: AppBuilderEditor,
  ResultRenderer: AppBuilderResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Design and create custom applications using AI',
  defaultConfig: {
    title: 'Create Application',
    description: 'Design and generate a new application workflow',
    systemPrompt: 'You are an application architect that designs custom applications using available plugins.',
    maxTasks: 5
  }
});