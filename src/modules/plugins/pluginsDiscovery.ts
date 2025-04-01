// src/modules/plugins/pluginsDiscovery.ts
import React from 'react';
import useDynamicComponentStore from './pluginsStore';
import { PluginType } from './types';
import { SystemConfig } from '../systemConfig';

// Flaga określająca, czy komponenty zostały już załadowane
let componentsLoaded = false;

/**
 * Configuration for plugin discovery
 */
export interface PluginDiscoveryConfig {
  enableFlowPlugins?: boolean;
  enableDashboardPlugins?: boolean;
}

/**
 * Default configuration for plugin discovery
 */
const defaultDiscoveryConfig: PluginDiscoveryConfig = {
  enableFlowPlugins: true,
  enableDashboardPlugins: true
};

/**
 * Funkcja wykrywająca dostępne komponenty pluginów i dodająca je do store
 * używa dynamicznego importu Vite do wczytania komponentów z katalogu dynamicComponents
 * oraz dashboardComponents
 */
export async function discoverAndLoadComponents(config?: PluginDiscoveryConfig) {
  // Jeśli komponenty zostały już załadowane, nie rób tego ponownie
  if (componentsLoaded) {
    return;
  }

  // Merge with default config
  const finalConfig = { ...defaultDiscoveryConfig, ...config };
  
  console.log('Discovering and loading plugin components...');
  const store = useDynamicComponentStore.getState();

  // Wczytaj flow plugins
  if (finalConfig.enableFlowPlugins) {
    await loadFlowPlugins(store);
  }
  
  // Wczytaj dashboard plugins
  if (finalConfig.enableDashboardPlugins) {
    await loadDashboardPlugins(store);
  }

  componentsLoaded = true;
  console.log('Finished loading all plugin components');
}

/**
 * Wczytuje pluginy flow
 */
async function loadFlowPlugins(
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  // Użyj funkcji import.meta.glob z Vite do dynamicznego importowania komponentów
  const modules = import.meta.glob('/src/dynamicComponents/*.tsx');
  
  console.log('Loading flow plugins from /src/dynamicComponents/*.tsx...');
  await loadModules(modules, 'flow', store);
}

/**
 * Wczytuje pluginy dashboard
 */
async function loadDashboardPlugins(
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  // Użyj funkcji import.meta.glob z Vite do dynamicznego importowania komponentów
  const modules = import.meta.glob('/src/dashboardComponents/*.tsx');
  
  console.log('Loading dashboard plugins from /src/dashboardComponents/*.tsx...');
  await loadModules(modules, 'dashboard', store);
}

/**
 * Wczytuje moduły i rejestruje je w store
 */
async function loadModules(
  modules: Record<string, () => Promise<{ default: React.ComponentType<unknown> }>>,
  pluginType: PluginType,
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  for (const path in modules) {
    try {
      const module = await modules[path]();
      const component = module.default;
      
      if (!component) {
        console.warn(`No default export found in ${path}`);
        continue;
      }
      
      // Pobierz nazwę pliku bez rozszerzenia
      const fileName = path.split('/').pop() || '';
      const name = fileName.replace(/\.[^.]+$/, '');
      
      // Zarejestruj komponent w store z odpowiednim typem
      store.registerComponent(name, component, pluginType);
      console.log(`Registered ${pluginType} plugin component: ${name}`);
    } catch (error) {
      console.error(`Error loading component from ${path}:`, error);
    }
  }
}

// Funkcja do inicjalizacji dodatkowych modułów
export async function initializePluginModules(config?: Partial<SystemConfig>) {
  const options = config || {};
  const { 
    enableLanguageLearning = false, 
    enableDashboard = true,
    enableFlowPlugins = true,
    enableDashboardPlugins = true
  } = options;
  
  // Konfiguracja pluginów
  const pluginConfig: PluginDiscoveryConfig = {
    enableFlowPlugins,
    enableDashboardPlugins: enableDashboard && enableDashboardPlugins,
  };
  
  // Inicjalizuj komponenty pluginów z odpowiednią konfiguracją
  await discoverAndLoadComponents(pluginConfig);
  
  // Opcja nauki języków powinna być implementowana przez pluginy stworzone w GUI
  if (enableLanguageLearning) {
    console.log("Language learning should be implemented through GUI plugins rather than hardcoded components");
  }
}

// Eksportujmy domyślną konfigurację modułów
export const defaultPluginModulesConfig: Partial<SystemConfig> = {
  enableLanguageLearning: false,
  enableDashboard: true,
  enableFlowPlugins: true,
  enableDashboardPlugins: true
};
