// src/pages/stepsPlugins/documentEditor/index.ts
import { register } from '../registry';

import { PLUGIN_CATEGORIES } from '../registry';
import { DocumentEditorEditor } from './DocumentEditorEditor';
import { DocumentEditorViewer } from './DocumentEditorViewer';
import { DocumentEditorResult } from './ocumentEditorResult';

register({
  type: 'document-editor',
  name: 'Document Editor',
  Viewer: DocumentEditorViewer,
  Editor: DocumentEditorEditor,
  ResultRenderer: DocumentEditorResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Create, edit, or review documents collaboratively',
  defaultConfig: {
    title: 'Edit Document',
    description: 'Create or edit a document',
    documentTitle: 'New Document',
    documentType: 'markdown',
    initialContent: '',
    enableAIAssistance: true,
    saveDocumentToFolder: 'root',
    tags: []
  }
});
