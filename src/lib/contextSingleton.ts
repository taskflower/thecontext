// src/lib/contextSingleton.ts
import { ContextManager } from '../../raw_modules/context-manager-module/src/core/ContextManager';

// Create a singleton instance of the ContextManager
export const contextManager = new ContextManager();

/**
 * Initialize context with initial data
 */
export function initializeContext(initialContext?: Record<string, any>) {
  if (initialContext) {
    contextManager.setContext(initialContext);
  }
}