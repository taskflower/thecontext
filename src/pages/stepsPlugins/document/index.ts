// src/pages/stepsPlugins/document/index.ts
import { register } from '../registry';
import DocumentEditor from './DocumentEditor';
import DocumentViewer from './DocumentViewer';


register({
  type: 'document',
  name: 'Document Editor',
  Viewer: DocumentViewer,
  Editor: DocumentEditor,
  defaultConfig: {
    title: 'Document Editor',
    description: 'Create or edit a document',
    template: '', // Default empty template
    format: 'markdown', // Default format
    minLength: 0,
    maxLength: 10000,
    suggestions: []
  }
});