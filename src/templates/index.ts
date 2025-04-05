/**
 * Template registry and exports
 */
import type { TemplateConfig } from './types';
import defaultTemplate from './default';
import elearningTemplate from './elearning';
import alternativeTemplate from './alternative';

// Template registry
const templates: Record<string, TemplateConfig> = {
  default: defaultTemplate,
  elearning: elearningTemplate,
  alternative: alternativeTemplate,
};

/**
 * Get all available templates
 */
export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(templates);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): TemplateConfig | undefined => {
  return templates[id];
};

/**
 * Register new template
 */
export const registerTemplate = (template: TemplateConfig): void => {
  if (templates[template.id]) {
    console.warn(`Template with id ${template.id} already exists. Overwriting.`);
  }
  templates[template.id] = template;
};

/**
 * Unregister template
 */
export const unregisterTemplate = (id: string): void => {
  if (!templates[id]) {
    console.warn(`Template with id ${id} does not exist.`);
    return;
  }
  
  if (id === 'default') {
    console.warn('Cannot unregister default template.');
    return;
  }
  
  delete templates[id];
};

export type { TemplateConfig } from './types';
export default templates;