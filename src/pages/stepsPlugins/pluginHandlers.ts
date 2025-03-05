// src/pages/stepsPlugins/pluginHandlers.ts
// System globalnych handlerów pluginów

// Typ dla handlera akcji pluginu
export type PluginActionHandler = () => void;

// Globalna mapa handlerów
type HandlersMap = Record<string, PluginActionHandler>;

// Deklarujemy rozszerzenie typu Window
declare global {
  interface Window {
    __PLUGIN_HANDLERS__: HandlersMap;
  }
}

// Inicjalizuj globalną mapę handlerów jeśli nie istnieje
if (!window.__PLUGIN_HANDLERS__) {
  window.__PLUGIN_HANDLERS__ = {};
}

/**
 * Rejestruje handler akcji dla danego kroku pluginu
 */
export function registerPluginHandler(stepId: string, handler: PluginActionHandler): void {
  window.__PLUGIN_HANDLERS__[stepId] = handler;
}

/**
 * Usuwa handler akcji dla danego kroku
 */
export function unregisterPluginHandler(stepId: string): void {
  delete window.__PLUGIN_HANDLERS__[stepId];
}

/**
 * Wywołuje akcję pluginu dla danego kroku
 * @returns true jeśli handler został znaleziony i wywołany, false w przeciwnym razie
 */
export function triggerPluginAction(stepId: string): boolean {
  const handler = window.__PLUGIN_HANDLERS__[stepId];
  if (handler && typeof handler === 'function') {
    handler();
    return true;
  }
  return false;
}