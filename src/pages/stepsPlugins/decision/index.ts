// src/pages/stepsPlugins/decision/index.ts
import { PLUGIN_CATEGORIES, register } from '../registry';
import DecisionEditor from './DecisionEditor';
import DecisionViewer from './DecisionViewer';
import DecisionResult from './DecisionResult';


register({
  type: 'decision',
  name: 'Approval Request',
  category: PLUGIN_CATEGORIES.APPROVAL,
  description: 'Request approvals or decisions from stakeholders',
  Viewer: DecisionViewer,
  Editor: DecisionEditor,
  ResultRenderer: DecisionResult,
  defaultConfig: {
    title: 'Request Document Approval',
    description: 'This document requires approval to proceed with the project',
    approveLabel: 'Approve',
    rejectLabel: 'Reject',
    requireComment: true,
    options: [
      { id: 'approve', label: 'Approve', color: 'green' },
      { id: 'needs_revision', label: 'Needs Revision', color: 'yellow' },
      { id: 'reject', label: 'Reject', color: 'red' }
    ]
  }
});