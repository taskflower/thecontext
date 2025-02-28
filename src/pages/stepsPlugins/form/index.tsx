// src/pages/tasks/TaskFlow/plugins/form/index.ts
import { registerPlugin } from '../registry';
import { FormConfig, FormPluginOptions } from './types';
import FormRenderer from './renderer';

// Register this plugin with renderer included
registerPlugin({
  type: 'form',
  title: 'Form Step',
  description: 'Collect information using a form',
  defaultConfig: {
    title: 'Form Step',
    description: 'Please fill out the form below',
    submitLabel: 'Submit',
    fields: [
      { name: 'field1', label: 'Field 1', type: 'text', required: true }
    ]
  } as FormConfig,
  defaultOptions: {
    savePartial: true,
    allowMultiple: false
  } as FormPluginOptions,
  renderer: FormRenderer
});