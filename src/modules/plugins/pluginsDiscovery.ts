/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins/pluginsDiscovery.ts
import React from 'react';
import useDynamicComponentStore from './pluginsStore';
import { PluginType } from './types';
import { SystemConfig } from '../systemConfig';

// Flags to track plugin loading state
let componentsLoaded = false;
let componentsLoading = false;

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
 * Creates a basic React component for fallback/default widgets
 */
const createBasicComponent = (name: string, content: string) => {
  return () => React.createElement('div', {
    className: 'p-4 h-full flex flex-col',
    style: { fontFamily: 'system-ui, sans-serif' }
  }, [
    React.createElement('h3', { 
      key: 'title',
      className: 'text-sm font-medium mb-3'
    }, name),
    React.createElement('p', { 
      key: 'content',
      className: 'text-xs text-gray-500'
    }, content)
  ]);
};

/**
 * Main function to discover and load available plugin components and add them to the store
 * Uses dynamic Vite imports to load components from dynamic and dashboard components folders
 */
export async function discoverAndLoadComponents(config?: PluginDiscoveryConfig) {
  // Skip if components already loaded or currently loading
  if (componentsLoaded) {
    console.log('Plugin components already loaded, skipping discovery');
    return;
  }
  
  // Prevent concurrent loading attempts
  if (componentsLoading) {
    console.log('Plugin discovery already in progress, skipping duplicate call');
    return;
  }
  
  // Set loading flag
  componentsLoading = true;

  // Merge with default config
  const finalConfig = { ...defaultDiscoveryConfig, ...config };
  
  console.log('🔍 Discovering and loading plugin components...');
  const store = useDynamicComponentStore.getState();

  try {
    // Load flow plugins if enabled
    if (finalConfig.enableFlowPlugins) {
      await loadFlowPlugins(store);
    }
    
    // Load dashboard plugins if enabled
    if (finalConfig.enableDashboardPlugins) {
      await loadDashboardPlugins(store);
    }

    componentsLoaded = true;
    console.log('✅ Finished loading all plugin components');
  } 
  catch (error) {
    console.error('❌ Error during plugin discovery:', error);
    
    // Add fallback components even if there's an error
    registerFallbackComponents(store);
  }
  finally {
    // Always reset loading flag
    componentsLoading = false;
  }
}

/**
 * Register fallback components to ensure UI doesn't break
 */
function registerFallbackComponents(store: ReturnType<typeof useDynamicComponentStore.getState>) {
  console.log('Registering fallback components for stability');
  
  // Flow plugin fallbacks
  if (store.getComponentKeysByType('flow').length === 0) {
    const BasicFlowComponent = createBasicComponent('Basic Flow Step', 'This is a basic flow step component.');
    store.registerComponent('BasicFlowPlugin', BasicFlowComponent, 'flow');
  }
  
  // Dashboard plugin fallbacks
  if (store.getComponentKeysByType('dashboard').length === 0) {
    const StatusComponent = createBasicComponent('Status Widget', 'System status information will appear here.');
    store.registerComponent('StatusWidget', StatusComponent, 'dashboard');
    
    const MetricsComponent = createBasicComponent('Metrics Widget', 'Application metrics will appear here.');
    store.registerComponent('MetricsWidget', MetricsComponent, 'dashboard');
  }
}

/**
 * Loads flow plugins
 */
async function loadFlowPlugins(
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  try {
    // Use Vite's import.meta.glob for dynamic component imports
    const modules:any = import.meta.glob('/src/dynamicComponents/*.tsx');
    
    const moduleKeys = Object.keys(modules);
    if (moduleKeys.length === 0) {
      console.warn('⚠️ No flow plugins found in /src/dynamicComponents/*.tsx');
      
      // Register a fallback plugin
      const BasicFlowComponent = createBasicComponent('Basic Flow Step', 'This is a basic flow step plugin.');
      store.registerComponent('BasicFlowPlugin', BasicFlowComponent, 'flow');
    } else {
      console.log(`📦 Loading ${moduleKeys.length} flow plugins...`);
      await loadModules(modules, 'flow', store);
    }
  } catch (error) {
    console.error('❌ Error loading flow plugins:', error);
    
    // Register fallback on error
    const ErrorFlowComponent = createBasicComponent('Error', 'An error occurred loading flow plugins.');
    store.registerComponent('ErrorFlowPlugin', ErrorFlowComponent, 'flow');
  }
}

/**
 * Loads dashboard plugins
 */
async function loadDashboardPlugins(
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  try {
    // Use Vite's import.meta.glob for dynamic component imports
    const modules:any = import.meta.glob('/src/dashboardComponents/*.tsx');
    
    const moduleKeys = Object.keys(modules);
    if (moduleKeys.length === 0) {
      console.warn('⚠️ No dashboard plugins found in /src/dashboardComponents/*.tsx');
      
      // Register fallback dashboard plugins
      const StatusComponent = createBasicComponent('Status Widget', 'System status information will appear here.');
      store.registerComponent('StatusWidget', StatusComponent, 'dashboard');
      
      const MetricsComponent = createBasicComponent('Metrics Widget', 'Application metrics will appear here.');
      store.registerComponent('MetricsWidget', MetricsComponent, 'dashboard');
    } else {
      console.log(`📦 Loading ${moduleKeys.length} dashboard plugins...`);
      await loadModules(modules, 'dashboard', store);
    }
  } catch (error) {
    console.error('❌ Error loading dashboard plugins:', error);
    
    // Register fallback on error
    const ErrorDashboardComponent = createBasicComponent('Error Widget', 'An error occurred loading dashboard plugins.');
    store.registerComponent('ErrorDashboardWidget', ErrorDashboardComponent, 'dashboard');
  }
}

/**
 * Loads modules and registers them in the store
 */
async function loadModules(
  modules: Record<string, () => Promise<{ default: React.ComponentType<unknown> }>>,
  pluginType: PluginType,
  store: ReturnType<typeof useDynamicComponentStore.getState>
) {
  let successCount = 0;
  let errorCount = 0;
  
  for (const path in modules) {
    try {
      const module = await modules[path]();
      const component:any = module.default;
      
      if (!component) {
        console.warn(`⚠️ No default export found in ${path}`);
        continue;
      }
      
      // Extract filename without extension
      const fileName = path.split('/').pop() || '';
      const name = fileName.replace(/\.[^.]+$/, '');
      
      // Register component with the appropriate type
      store.registerComponent(name, component, pluginType);
      successCount++;
      console.log(`✅ Registered ${pluginType} plugin: ${name}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error loading component from ${path}:`, error);
    }
  }
  
  console.log(`📊 ${pluginType} plugins loaded: ${successCount} success, ${errorCount} failed`);
}

/**
 * Initialize plugin modules based on system configuration
 */
export async function initializePluginModules(config?: Partial<SystemConfig>) {
  const options = config || {};
  const { 
    enableLanguageLearning = false, 
    enableDashboard = true,
    enableFlowPlugins = true,
    enableDashboardPlugins = true
  } = options;
  
  // Configure plugins
  const pluginConfig: PluginDiscoveryConfig = {
    enableFlowPlugins,
    enableDashboardPlugins: enableDashboard && enableDashboardPlugins,
  };
  
  // Initialize plugin components with appropriate configuration
  await discoverAndLoadComponents(pluginConfig);
  
  // Language learning should be implemented through GUI plugins
  if (enableLanguageLearning) {
    console.log("Language learning should be implemented through GUI plugins rather than hardcoded components");
  }
}

// Export default module configuration
export const defaultPluginModulesConfig: Partial<SystemConfig> = {
  enableLanguageLearning: false,
  enableDashboard: true,
  enableFlowPlugins: true,
  enableDashboardPlugins: true
};