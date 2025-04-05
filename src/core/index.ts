/**
 * Core functionality exports
 */
import * as types from './types';
import * as hooks from './hooks/useTemplateSystem';
import * as contextProcessor from './services/contextProcessor';

// Export everything
export {
  types,
  hooks,
  contextProcessor
};

// Export specific hooks for convenience
export { useTemplateSystem } from './hooks/useTemplateSystem';

// Export specific types
export { ENTITY_TYPES } from './types';