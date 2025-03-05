/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/registry.ts
import { StepPlugin } from './types';
import { registerDefaultValidators } from './validation';

// Kategorie pluginów
export const PLUGIN_CATEGORIES = {
  CONTENT: "Tworzenie Treści",
  APPROVAL: "Zatwierdzanie i Recenzje",
  DATA: "Zbieranie Danych",
  INTEGRATION: "Integracje"
};

// Rejestr pluginów - przechowuje wszystkie dostępne pluginy
const plugins = new Map<string, StepPlugin>();

// Inicjalizuj walidatory podczas pierwszego importu
registerDefaultValidators();

/**
 * Rejestruje plugin w systemie
 */
export function register(plugin: StepPlugin): void {
  plugins.set(plugin.type, plugin);
  console.log(`Zarejestrowano plugin: ${plugin.type} (${plugin.name})`);
}

/**
 * Pobiera plugin na podstawie jego typu
 */
export function getPlugin(type: string): StepPlugin | undefined {
  return plugins.get(type);
}

/**
 * Pobiera listę wszystkich zarejestrowanych pluginów
 */
export function getAllPlugins(): StepPlugin[] {
  return Array.from(plugins.values());
}

/**
 * Pobiera pluginy z określonej kategorii
 */
export function getPluginsByCategory(category: string): StepPlugin[] {
  return getAllPlugins().filter(plugin => plugin.category === category);
}

/**
 * Pobiera domyślną konfigurację dla pluginu
 */
export function getDefaultConfig(type: string): Record<string, any> {
  return plugins.get(type)?.defaultConfig || {};
}

/**
 * Tworzy nowy krok określonego typu z domyślnymi wartościami
 */
export function createDefaultStep(type: string, taskId: string, order: number): Partial<any> {
  const plugin = getPlugin(type);
  if (!plugin) return {};
  
  return {
    type,
    taskId,
    order,
    title: plugin.name,
    description: plugin.description,
    config: { ...plugin.defaultConfig },
    status: 'pending',
    options: {},
    result: null
  };
}

// Eksportuj funkcje walidacji
export { validateStep } from './validation';