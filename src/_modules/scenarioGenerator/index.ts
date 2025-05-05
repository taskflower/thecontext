// src/_modules/scenarioGenerator/index.ts

// Main component
export { default as ScenarioGenerator } from './components/ScenarioGenerator';

// Hooks
export { useLlmService } from './hooks/useLlmService';
export { useScenarioEditor } from './hooks/useScenarioEditor';

// Utils
export {
  validateScenario,
  generateScenarioImplementation,
  generateInitialContextCode,
  createDefaultStep,
  reorderSteps,
  generateScenarioId,
  generateStepId
} from './utils/scenarioUtils';

export {
  generateSampleSchema,
  generateDefaultLlmPrompt,
  generateDefaultWidgets
} from './utils/schemaUtils';

// Types
export type {
  ScenarioTemplate,
  StepData,
  EnhancedScenario,
  FormField,
  LlmService,
  ValidationResult
} from './types';