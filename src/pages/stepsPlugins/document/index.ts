// src/pages/stepsPlugins/document/index.ts
import { PLUGIN_CATEGORIES, register } from '../registry';
import DocumentEditor from './DocumentEditor';
import DocumentViewer from './DocumentViewer';
import DocumentResult from './DocumentResult';

// src/pages/stepsPlugins/document/index.ts
register({
  type: 'document',
  name: 'Document Editor',
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Create or edit structured documents manually',
  Viewer: DocumentViewer,
  Editor: DocumentEditor,
  ResultRenderer: DocumentResult,
  defaultConfig: {
    title: 'Project Requirements Document',
    description: 'Create a document with project requirements and specifications',
    template: '# Project Requirements\n\n## Overview\n\n[Provide a brief description of the project]\n\n## Requirements\n\n1. \n2. \n3. \n\n## Timeline\n\n- Start date: \n- End date: \n',
    format: 'markdown',
    minLength: 0,
    maxLength: 10000,
    suggestions: [
      '## Technical Requirements',
      '## User Stories',
      '## Acceptance Criteria',
      '## Risks and Mitigation'
    ]
  }
});