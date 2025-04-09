// src/templates/index.ts
import { useAppStore } from '../lib/store';
import { templateRegistry, registerTemplate } from './registry';
import { DefaultTemplate } from './default';
import { NewYorkTemplate } from './newyork';
import { Workspace } from '../lib/store';

// Export template registry for use elsewhere
export { templateRegistry };

/**
 * Initialize all templates and set initial application data
 */
export function initializeTemplates() {
  // Create template instances
  const defaultTemplate = new DefaultTemplate();
  const newyorkTemplate = new NewYorkTemplate();
  
  // Register templates with the registry
  registerTemplate(defaultTemplate);
  registerTemplate(newyorkTemplate);
  
  // Get workspace data
  const defaultWorkspace = defaultTemplate.getDefaultWorkspaceData();
  const newyorkWorkspace = newyorkTemplate.getDefaultWorkspaceData();
  
  // Convert to the expected Workspace format
  const workspaces: Workspace[] = [
    {
      id: defaultWorkspace.id,
      name: defaultWorkspace.name,
      scenarios: defaultWorkspace.scenarios || [],
      templateSettings: defaultWorkspace.templateSettings,
      initialContext: defaultWorkspace.initialContext
    },
    {
      id: newyorkWorkspace.id,
      name: newyorkWorkspace.name,
      scenarios: newyorkWorkspace.scenarios || [], 
      templateSettings: newyorkWorkspace.templateSettings,
      initialContext: newyorkWorkspace.initialContext
    }
  ];
  
  // Initialize app state with workspaces
  if (workspaces && workspaces.length > 0) {
    useAppStore.getState().setInitialWorkspaces(workspaces);
  }
}