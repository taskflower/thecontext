// src/index.ts
// Główny punkt wejściowy eksportujący API modułu

// Eksport głównej klasy TemplateRegistry
export { TemplateRegistry, createTemplateRegistry } from './core/TemplateRegistry';

// Eksport wszystkich typów
export * from './types';

// Eksport walidatorów i helperów
export { 
  validateLayoutTemplate,
  validateWidgetTemplate,
  validateFlowStepTemplate,
  TemplateValidationError
} from './utils/TemplateValidators';

export {
  getDefaultLayoutTemplate,
  getDefaultWidgetTemplate,
  getDefaultFlowStepTemplate,
  findCompatibleFlowStepTemplate,
  normalizePath
} from './utils/registryHelpers';