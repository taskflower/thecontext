// src/templates/index.ts
import { createTemplateRegistry } from 'template-registry-module';
import { registerDefaultTemplates, getDefaultTemplateData } from './default';
import { useAppStore } from '../lib/store';

// Create and export template registry
export const templateRegistry = createTemplateRegistry();

/**
 * Initialize all templates and set initial application data
 */
export function initializeTemplates() {
  // Register all templates
  registerDefaultTemplates(templateRegistry);
  
  // Initialize app data from template data
  const { workspace } = getDefaultTemplateData();
  useAppStore.getState().setInitialWorkspaces([workspace]);
}