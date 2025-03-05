// index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { SimplePluginEditor } from './SimplePluginEditor';
import { SimplePluginResult } from './SimplePluginResult';
import { SimplePluginViewer } from './SimplePluginViewer';

register({
  type: 'simple-plugin',
  name: 'Simple Plugin',
  Viewer: SimplePluginViewer,
  Editor: SimplePluginEditor,
  ResultRenderer: SimplePluginResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'A simple plugin template',
  defaultConfig: {
    title: 'Simple Plugin',
    description: 'This is a simple plugin step'
  }
});