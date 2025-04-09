// src/templates/index.ts (aktualizacja)
import { createTemplateRegistry } from 'template-registry-module';
import { registerDefaultTemplates, getDefaultTemplateData } from './default';
import { registerNewYorkTemplates, getNewYorkTemplateData } from './newyork';
import { registerDuolingoTemplates, getDuolingoTemplateData } from './duolingo';
import { useAppStore } from '../lib/store';

// Tworzenie rejestru szablonów
export const templateRegistry = createTemplateRegistry();

// Rejestracja wszystkich szablonów i inicjalizacja store
export function initializeTemplates() {
  // Rejestracja szablonów
  registerDefaultTemplates(templateRegistry);
  registerNewYorkTemplates(templateRegistry);
  registerDuolingoTemplates(templateRegistry); // Dodana rejestracja szablonu Duolingo
  
  // Pobranie danych inicjalizacyjnych z szablonów
  const defaultData = getDefaultTemplateData();
  const newyorkData = getNewYorkTemplateData();
  const duolingoData = getDuolingoTemplateData(); // Dodane pobranie danych Duolingo
  
  // Połączenie danych i inicjalizacja store
  const initialWorkspaces = [
    defaultData.workspace,
    newyorkData.workspace,
    duolingoData.workspace  // Dodany workspace Duolingo
  ];
  
  // Inicjalizacja store z danymi z szablonów
  const { setInitialWorkspaces } = useAppStore.getState();
  setInitialWorkspaces(initialWorkspaces);
  
  console.log('Templates initialized and store populated with workspaces:', initialWorkspaces.length);
}

// Eksport funkcji pomocniczych (bez zmian)
export const getLayoutComponent = (id: string) => 
  templateRegistry.getLayout(id)?.component;

export const getWidgetComponent = (id: string) => 
  templateRegistry.getWidget(id)?.component;

export const getFlowStepComponent = (id: string) => 
  templateRegistry.getFlowStep(id)?.component;

export const getWidgetsByCategory = (category: 'scenario' | 'workspace' | 'flow') => 
  templateRegistry.getWidgetsByCategory(category);