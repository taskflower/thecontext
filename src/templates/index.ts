// src/templates/index.ts

import { templateRegistry, registerTemplate } from './registry';
import { DefaultTemplate } from './default';
import { NewYorkTemplate } from './newyork';
import { SimpleTemplate } from './simple';
import { useAppStore, Workspace } from '@/lib/store';


// Export template registry for use elsewhere
export { templateRegistry };

/**
 * Initialize all templates and set initial application data
 */
export function initializeTemplates() {
  console.log("Initializing templates...");
  
  // Create template instances
  const defaultTemplate = new DefaultTemplate();
  const newyorkTemplate = new NewYorkTemplate();
  const simpleTemplate = new SimpleTemplate();
  
  console.log("Template instances created:", {
    default: defaultTemplate.id,
    newyork: newyorkTemplate.id,
    simple: simpleTemplate.id
  });
  
  // Register templates with the registry
  registerTemplate(defaultTemplate);
  registerTemplate(newyorkTemplate);
  registerTemplate(simpleTemplate);
  
  console.log("Templates registered with registry");
  
  // Get workspace data
  const defaultWorkspace = defaultTemplate.getDefaultWorkspaceData();
  const newyorkWorkspace = newyorkTemplate.getDefaultWorkspaceData();
  const simpleWorkspace = simpleTemplate.getDefaultWorkspaceData();
  
  console.log("Workspace data retrieved:", {
    default: {
      id: defaultWorkspace.id,
      hasInitialContext: !!defaultWorkspace.initialContext,
      initialContextKeys: defaultWorkspace.initialContext ? Object.keys(defaultWorkspace.initialContext) : []
    },
    newyork: {
      id: newyorkWorkspace.id,
      hasInitialContext: !!newyorkWorkspace.initialContext,
      initialContextKeys: newyorkWorkspace.initialContext ? Object.keys(newyorkWorkspace.initialContext) : []
    },
    simple: {
      id: simpleWorkspace.id,
      hasInitialContext: !!simpleWorkspace.initialContext,
      initialContextKeys: simpleWorkspace.initialContext ? Object.keys(simpleWorkspace.initialContext) : []
    }
  });
  
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
    },
    {
      id: simpleWorkspace.id,
      name: simpleWorkspace.name,
      scenarios: simpleWorkspace.scenarios || [],
      templateSettings: simpleWorkspace.templateSettings,
      initialContext: simpleWorkspace.initialContext
    }
  ];
  
  console.log("Final workspaces prepared:", workspaces.map(w => ({
    id: w.id,
    hasInitialContext: !!w.initialContext,
    initialContextKeys: w.initialContext ? Object.keys(w.initialContext) : []
  })));
  
  // Initialize app state with workspaces
  if (workspaces && workspaces.length > 0) {
    console.log("Setting initial workspaces in appStore");
    
    try {
      const appStore = useAppStore.getState();
      appStore.setInitialWorkspaces(workspaces);
      
      // Verify that workspaces were set correctly
      const storeWorkspaces = useAppStore.getState().workspaces;
      console.log("Verified workspaces in store:", storeWorkspaces.map(w => ({
        id: w.id,
        hasInitialContext: !!w.initialContext
      })));
    } catch (error) {
      console.error("Error setting initial workspaces:", error);
    }
  } else {
    console.warn("No workspaces to initialize!");
  }
}