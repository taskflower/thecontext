// src/modules/flow/components/templateFactory.ts
import { DialogComponents, DialogTemplate } from './interfaces';
import * as defaultTemplate from './templates/default';
import * as alternativeTemplate from './templates/alternative';
import * as elearningTemplate from './templates/elearning';

// Słownik dostępnych szablonów
const templates: Record<DialogTemplate, DialogComponents> = {
  default: defaultTemplate.components,
  alternative: alternativeTemplate.components,
  elearning: elearningTemplate.components
};

// Własne szablony zarejestrowane przez aplikację
const customTemplates: Record<string, DialogComponents> = {};

/**
 * Pobiera komponenty dialogowe dla wybranego szablonu
 */
export function getTemplateComponents(template: DialogTemplate | string): DialogComponents {
  // Sprawdź czy to standardowy szablon
  if (template in templates) {
    return templates[template as DialogTemplate];
  }
  
  // Sprawdź czy to zarejestrowany własny szablon
  if (template in customTemplates) {
    return customTemplates[template];
  }
  
  // Fallback do domyślnego szablonu
  console.warn(`Template "${template}" not found, using default`);
  return templates.default;
}

/**
 * Rejestruje nowy szablon komponentów
 */
export function registerTemplate(name: string, components: DialogComponents): void {
  if (name in templates) {
    console.warn(`Cannot override built-in template "${name}"`);
    return;
  }
  
  customTemplates[name] = components;
}

/**
 * Usuwa zarejestrowany szablon
 */
export function unregisterTemplate(name: string): void {
  if (name in templates) {
    console.warn(`Cannot unregister built-in template "${name}"`);
    return;
  }
  
  delete customTemplates[name];
}

/**
 * Zwraca listę dostępnych szablonów
 */
export function getAvailableTemplates(): string[] {
  return [...Object.keys(templates), ...Object.keys(customTemplates)];
}