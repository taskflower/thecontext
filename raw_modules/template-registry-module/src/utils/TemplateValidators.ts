import { LayoutTemplate, WidgetTemplate, FlowStepTemplate } from '../types';

/**
 * Klasa błędu walidacji szablonu
 */
export class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

/**
 * Waliduje szablon layoutu
 */
export function validateLayoutTemplate(template: LayoutTemplate): boolean {
  if (!template.id) {
    throw new TemplateValidationError('Layout template must have an id');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Layout template must have a name');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Layout template must have a component');
  }
  
  return true;
}

/**
 * Waliduje szablon widgetu
 */
export function validateWidgetTemplate(template: WidgetTemplate): boolean {
  if (!template.id) {
    throw new TemplateValidationError('Widget template must have an id');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Widget template must have a name');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Widget template must have a component');
  }
  
  const validCategories = ['scenario', 'workspace', 'flow'];
  if (!template.category || !validCategories.includes(template.category)) {
    throw new TemplateValidationError(`Widget template must have a valid category: ${validCategories.join(', ')}`);
  }
  
  return true;
}

/**
 * Waliduje szablon kroku przepływu
 */
export function validateFlowStepTemplate(template: FlowStepTemplate): boolean {
  if (!template.id) {
    throw new TemplateValidationError('Flow step template must have an id');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Flow step template must have a name');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Flow step template must have a component');
  }
  
  if (!template.compatibleNodeTypes || !Array.isArray(template.compatibleNodeTypes) || template.compatibleNodeTypes.length === 0) {
    throw new TemplateValidationError('Flow step template must have at least one compatible node type');
  }
  
  return true;
}