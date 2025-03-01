// src/pages/stepsPlugins/checklist/index.ts
import { PLUGIN_CATEGORIES, register } from '../registry';
import ChecklistEditor from './ChecklistEditor';
import ChecklistViewer from './ChecklistViewer';
import ChecklistResult from './ChecklistResult';

// src/pages/stepsPlugins/checklist/index.ts
register({
  type: 'checklist',
  name: 'Review Checklist',
  category: PLUGIN_CATEGORIES.APPROVAL,
  description: 'Verify task completion with a structured checklist',
  Viewer: ChecklistViewer,
  Editor: ChecklistEditor,
  ResultRenderer: ChecklistResult,
  defaultConfig: {
    title: 'Quality Assurance Checklist',
    description: 'Verify that all quality criteria have been met before proceeding',
    items: [
      { id: 'item1', text: 'All requirements are fulfilled', required: true },
      { id: 'item2', text: 'Code passes all tests', required: true },
      { id: 'item3', text: 'Documentation is complete', required: true },
      { id: 'item4', text: 'Performance meets criteria', required: false }
    ],
    requireAllItems: true
  }
});