// src/pages/stepsPlugins/checklist/index.ts
import { register } from '../registry';
import ChecklistEditor from './ChecklistEditor';
import ChecklistViewer from './ChecklistViewer';


register({
  type: 'checklist',
  name: 'Checklist',
  Viewer: ChecklistViewer,
  Editor: ChecklistEditor,
  defaultConfig: {
    title: 'Verification Checklist',
    description: 'Complete all items in this checklist',
    items: [
      { id: 'item1', text: 'First item to verify', required: true },
      { id: 'item2', text: 'Second item to verify', required: false }
    ],
    requireAllItems: true
  }
});