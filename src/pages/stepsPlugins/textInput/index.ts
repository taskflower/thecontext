// src/pages/stepsPlugins/textInput/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { TextInputEditor } from './TextInputEditor';
import { TextInputResult } from './TextInputResult';
import { TextInputViewer } from './TextInputViewer';


register({
  type: 'text-input',
  name: 'Text Input',
  Viewer: TextInputViewer,
  Editor: TextInputEditor,
  ResultRenderer: TextInputResult,
  category: PLUGIN_CATEGORIES.DATA,
  description: 'Collect text input from the user',
  defaultConfig: {
    title: 'Text Input',
    description: 'Please provide the requested information',
    placeholder: 'Enter your text here...',
    minLength: 0,
    maxLength: 1000,
    required: true,
    multiline: true,
    rows: 6
  }
});