// src/pages/stepsPlugins/form/index.ts
import { PLUGIN_CATEGORIES, register } from '../registry';
import FormEditor from './FormEditor';
import FormViewer from './FormViewer';
import FormResult from './FormResult';

// src/pages/stepsPlugins/form/index.ts
register({
  type: 'form',
  name: 'Data Collection Form',
  category: PLUGIN_CATEGORIES.DATA,
  description: 'Collect structured information needed for the task',
  Viewer: FormViewer,
  Editor: FormEditor,
  ResultRenderer: FormResult,
  defaultConfig: {
    title: 'Project Information',
    description: 'Please provide the required project details to proceed',
    fields: [
      { name: 'projectName', label: 'Project Name', type: 'text', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'budget', label: 'Budget', type: 'number', required: true },
      { name: 'description', label: 'Project Description', type: 'text', required: false }
    ]
  }
});