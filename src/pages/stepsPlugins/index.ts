// src/pages/stepsPlugins/index.ts
export { StepViewer } from './StepViewer';
export { StepEditor } from './StepEditor';
export { register, getPlugin, getAllPlugins, getDefaultConfig } from './registry';
export type { StepPlugin, ViewerProps, EditorProps } from './types';

// Import plugins manually to ensure they register
import './llmGenerator/index';
import './appBuilder/index';
import './dataCollector/index';
import './workflowBuilder/index';
import './documentEditor/index';
import './boilerplate/index';
