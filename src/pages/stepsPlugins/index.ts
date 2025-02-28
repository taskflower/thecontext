// src/pages/stepsPlugins/index.ts
export { StepViewer } from './StepViewer';
export { StepEditor } from './StepEditor';
export { register, getPlugin, getAllPlugins, getDefaultConfig } from './registry';
export type { StepPlugin, ViewerProps, EditorProps } from './types';

// Import plugins manually to ensure they register
import './form/index';
import './document/index';
import './checklist/index';
import './decision/index';
// Import other plugins here when you create them