// src/pages/stepsPlugins/dataCollector/index.ts
import { register } from '../registry';

import { PLUGIN_CATEGORIES } from '../registry';
import { DataCollectorEditor } from './DataCollectorEditor';
import { DataCollectorResult } from './DataCollectorResult';
import { DataCollectorViewer } from './DataCollectorViewer';

register({
  type: 'data-collector',
  name: 'Data Collector',
  Viewer: DataCollectorViewer,
  Editor: DataCollectorEditor,
  ResultRenderer: DataCollectorResult,
  category: PLUGIN_CATEGORIES.DATA,
  description: 'Collect structured data through customizable forms',
  defaultConfig: {
    title: 'Collect Data',
    description: 'Please fill in the required information',
    fields: [
      {
        id: 'field1',
        label: 'Field 1',
        type: 'text',
        required: true,
        placeholder: 'Enter value...'
      }
    ],
    useLLMToGenerateFields: false,
    fieldGenerationPrompt: 'Generate form fields to collect data for:'
  }
});