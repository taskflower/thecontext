// src/pages/stepsPlugins/workflowBuilder/index.ts
import { register } from '../registry';

import { PLUGIN_CATEGORIES } from '../registry';
import { WorkflowBuilderEditor } from './WorkflowBuilderEditor';
import { WorkflowBuilderResult } from './WorkflowBuilderResult';
import { WorkflowBuilderViewer } from './WorkflowBuilderViewer';

register({
  type: 'workflow-builder',
  name: 'Workflow Builder',
  Viewer: WorkflowBuilderViewer,
  Editor: WorkflowBuilderEditor,
  ResultRenderer: WorkflowBuilderResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Generate a complete workflow using AI',
  defaultConfig: {
    title: 'Build Workflow',
    description: 'Generate a complete task workflow using AI',
    systemPrompt: 'You are a workflow design assistant that helps build effective task sequences.',
    maxSteps: 10
  }
});
