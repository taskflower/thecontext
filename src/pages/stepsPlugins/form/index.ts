// src/pages/stepsPlugins/form/index.ts
import { register } from '../registry';
import FormEditor from './FormEditor';
import FormViewer from './FormViewer';
import FormResult from './FormResult';

register({
  type: 'form',
  name: 'Form Step',
  Viewer: FormViewer,
  Editor: FormEditor,
  ResultRenderer: FormResult,
  defaultConfig: {
    title: 'Form Step',
    description: 'Please fill out the form below',
    fields: [
      { name: 'field1', label: 'Field 1', type: 'text', required: true }
    ]
  }
});