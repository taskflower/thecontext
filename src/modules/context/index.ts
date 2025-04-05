/**
 * Context Management Module Entry Point
 * Exports all components, types, and utils for context management
 */

import ContextManager from './components/ContextManager';
import ContextList from './components/ContextList';
import ContextEditor from './components/ContextEditor';
import ContextDetails from './components/ContextDetails';
import ContextFilters from './components/ContextFilters';
import { useContextStore } from './contextStore';

// Export types
export * from './types';

// Export components
export {
  ContextManager,
  ContextList,
  ContextEditor,
  ContextDetails,
  ContextFilters,
  
  // Export store hooks
  useContextStore
};

// Default export for main component
export default ContextManager;