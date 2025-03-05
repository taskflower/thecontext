// src/pages/stepsPlugins/boilerplate_reference/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { StepReferenceEditor } from './StepReferenceEditor';
import { StepReferenceResult } from './StepReferenceResult';
import { StepReferenceViewer } from './StepReferenceViewer';

register({
  type: 'step-reference',
  name: 'Step Reference',
  Viewer: StepReferenceViewer,
  Editor: StepReferenceEditor,
  ResultRenderer: StepReferenceResult,
  category: PLUGIN_CATEGORIES.DATA,
  description: 'Reference and display data from a previous step',
  defaultConfig: {
    title: 'Step Reference',
    description: 'Displays data from a previous step',
    referenceStepId: ''
  }
});