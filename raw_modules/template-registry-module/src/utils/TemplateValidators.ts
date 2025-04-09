// src/utils/TemplateValidators.ts
// Walidacja szablonów

import { LayoutTemplate } from '../types/LayoutTemplate';
import { WidgetTemplate } from '../types/WidgetTemplate';
import { FlowStepTemplate } from '../types/FlowStepTemplate';

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
    throw new TemplateValidationError('Szablon layoutu musi mieć ID');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Szablon layoutu musi mieć nazwę');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Szablon layoutu musi mieć komponent');
  }
  
  return true;
}

/**
 * Waliduje szablon widgetu
 */
export function validateWidgetTemplate(template: WidgetTemplate): boolean {
  if (!template.id) {
    throw new TemplateValidationError('Szablon widgetu musi mieć ID');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Szablon widgetu musi mieć nazwę');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Szablon widgetu musi mieć komponent');
  }
  
  const validCategories = ['scenario', 'workspace', 'flow'];
  if (!template.category || !validCategories.includes(template.category)) {
    throw new TemplateValidationError(`Szablon widgetu musi mieć prawidłową kategorię: ${validCategories.join(', ')}`);
  }
  
  return true;
}

/**
 * Waliduje szablon kroku przepływu
 */
export function validateFlowStepTemplate(template: FlowStepTemplate): boolean {
  if (!template.id) {
    throw new TemplateValidationError('Szablon kroku przepływu musi mieć ID');
  }
  
  if (!template.name) {
    throw new TemplateValidationError('Szablon kroku przepływu musi mieć nazwę');
  }
  
  if (!template.component) {
    throw new TemplateValidationError('Szablon kroku przepływu musi mieć komponent');
  }
  
  if (!template.compatibleNodeTypes || !Array.isArray(template.compatibleNodeTypes) || template.compatibleNodeTypes.length === 0) {
    throw new TemplateValidationError('Szablon kroku przepływu musi mieć co najmniej jeden kompatybilny typ węzła');
  }
  
  return true;
}