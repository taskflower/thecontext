// Eksport głównej klasy TemplateRegistry
export { TemplateRegistry, createTemplateRegistry } from './TemplateRegistry';

// Eksport wszystkich typów
export * from './types';

// Eksport wszystkich potrzebnych interfejsów
export { LayoutProps, LayoutTemplate } from './types/LayoutTemplate';
export { WidgetProps, WidgetTemplate, WidgetCategory } from './types/WidgetTemplate';
export { FlowStepProps, FlowStepTemplate } from './types/FlowStepTemplate';

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