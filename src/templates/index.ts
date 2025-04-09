import { createTemplateRegistry } from 'template-registry-module';
import { registerDefaultTemplates } from './default';
import { registerNewYorkTemplates } from './newyork';

// Tworzenie rejestru szablonów
export const templateRegistry = createTemplateRegistry();

// Rejestracja wszystkich szablonów
export function initializeTemplates() {
  registerDefaultTemplates(templateRegistry);
  registerNewYorkTemplates(templateRegistry);
}

// Eksport funkcji pomocniczych
export const getLayoutComponent = (id: string) => 
  templateRegistry.getLayout(id)?.component;

export const getWidgetComponent = (id: string) => 
  templateRegistry.getWidget(id)?.component;

export const getFlowStepComponent = (id: string) => 
  templateRegistry.getFlowStep(id)?.component;

export const getWidgetsByCategory = (category: 'scenario' | 'workspace' | 'flow') => 
  templateRegistry.getWidgetsByCategory(category);