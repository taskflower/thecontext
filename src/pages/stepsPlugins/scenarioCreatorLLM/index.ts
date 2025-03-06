// src/pages/stepsPlugins/scenarioCreatorLLM/index.ts
import { register } from '../registry';
import { PLUGIN_CATEGORIES } from '../registry';
import { ScenarioCreatorLLMEditor } from './ScenarioCreatorLLMEditor';
import { ScenarioCreatorLLMResult } from './ScenarioCreatorLLMResult';
import { ScenarioCreatorLLMViewer } from './ScenarioCreatorLLMViewer';

// Import validation to ensure it's registered
import './validation';

// Register the plugin
register({
  type: 'scenario-creator-llm',
  name: 'Scenario Creator from LLM',
  Viewer: ScenarioCreatorLLMViewer,
  Editor: ScenarioCreatorLLMEditor,
  ResultRenderer: ScenarioCreatorLLMResult,
  category: PLUGIN_CATEGORIES.CONTENT,
  description: 'Create scenarios, tasks and steps based on LLM-generated data',
  defaultConfig: {
    title: 'Create Scenarios with LLM',
    description: 'Generate and create project scenarios using LLM',
    useMockData: true,
    projectPrefix: 'LLM Campaign',
    inputPrompt: 'Generate 3 marketing scenarios for a new product launch',
    mockResponse: false  // Changed to false to use the real API by default
  }
});