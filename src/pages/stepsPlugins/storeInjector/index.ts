// src/pages/stepsPlugins/storeInjector/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { StoreInjectorEditor } from './StoreInjectorEditor';
import { StoreInjectorResult } from './StoreInjectorResult';
import { StoreInjectorViewer } from './StoreInjectorViewer';

register({
  type: 'store-injector',
  name: 'Store Injector',
  Viewer: StoreInjectorViewer,
  Editor: StoreInjectorEditor,
  ResultRenderer: StoreInjectorResult,
  category: PLUGIN_CATEGORIES.DATA,
  description: 'Inject data into the application store',
  defaultConfig: {
    title: 'Store Injector',
    description: 'Review and confirm data to be saved',
    storeMethod: 'addScenario',
    entityType: 'scenario',
    sourceStep: '',
    itemsPath: 'scenarios',
    dataTransformer: '',
    previewFields: ['title', 'description'],
    confirmRequired: true
  }
});