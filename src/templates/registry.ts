// src/templates/registry.ts
import { createTemplateRegistry } from '../../raw_modules/template-registry-module/src';
import { BaseTemplate } from './baseTemplate';

// Create and export a singleton template registry
export const templateRegistry = createTemplateRegistry();

// A registry of all available templates
const templates: BaseTemplate[] = [];

/**
 * Register a template with the system
 * @param template The template to register
 */
export function registerTemplate(template: BaseTemplate): void {
  // Add to our internal registry
  templates.push(template);
  
  // Register components with the template registry
  const config = template.getConfig();
  
  // Register layouts
  config.layouts.forEach(layout => 
    templateRegistry.registerLayout(layout)
  );
  
  // Register widgets
  config.widgets.forEach(widget => 
    templateRegistry.registerWidget(widget)
  );
  
  // Register flow steps
  config.flowSteps.forEach(flowStep =>
    templateRegistry.registerFlowStep(flowStep as any)
  );
}

/**
 * Get a template by ID
 * @param id The ID of the template to retrieve
 */
export function getTemplate(id: string): BaseTemplate | undefined {
  return templates.find(t => t.id === id);
}

/**
 * Get all registered templates
 */
export function getAllTemplates(): ReadonlyArray<BaseTemplate> {
  return [...templates];
}