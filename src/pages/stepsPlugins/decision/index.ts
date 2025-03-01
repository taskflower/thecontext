// src/pages/stepsPlugins/decision/index.ts
import { register } from '../registry';
import DecisionEditor from './DecisionEditor';
import DecisionViewer from './DecisionViewer';
import DecisionResult from './DecisionResult';

register({
  type: 'decision',
  name: 'Decision Step',
  Viewer: DecisionViewer,
  Editor: DecisionEditor,
  ResultRenderer: DecisionResult,
  defaultConfig: {
    title: 'Approval Required',
    description: 'This step requires a decision to proceed',
    approveLabel: 'Approve',
    rejectLabel: 'Reject',
    requireComment: true,
    options: [
      { id: 'approve', label: 'Approve', color: 'green' },
      { id: 'reject', label: 'Reject', color: 'red' }
    ]
  }
});