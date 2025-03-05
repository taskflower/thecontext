// src/pages/stepsPlugins/scenarioCreator/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { ScenarioCreatorEditor } from './ScenarioCreatorEditor';
import { ScenarioCreatorResult } from './ScenarioCreatorResult';
import { ScenarioCreatorViewer } from './ScenarioCreatorViewer';

register({
  type: 'scenario-creator',
  name: 'Scenario Creator',
  Viewer: ScenarioCreatorViewer,
  Editor: ScenarioCreatorEditor,
  ResultRenderer: ScenarioCreatorResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Create multiple project scenarios from a template list',
  defaultConfig: {
    title: 'Create Scenarios',
    description: 'Select which scenarios to create for your project',
    useMockData: true,
    projectPrefix: 'Marketing Campaign'
  }
});