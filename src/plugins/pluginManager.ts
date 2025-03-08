/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/pluginManager.ts
import { 
  PluginRegistration, 
  PluginManager as IPluginManager, 
  StepConfig, 
  TaskContext 
} from './types';
import { usePluginStore } from './store/pluginStore';

/**
 * Enhanced plugin manager implementation
 */
export class PluginManager implements IPluginManager {
  private stepExecutors: Record<string, (context: TaskContext) => Promise<any>> = {};

  /**
   * Register a plugin in the system
   */
  registerPlugin(plugin: PluginRegistration): void {
    // Use the store for registration
    usePluginStore.getState().registerPlugin(plugin);
    console.log(`Plugin registered: ${plugin.id} (${plugin.name})`);
  }

  /**
   * Get a plugin by its ID
   */
  getPlugin(pluginId: string): PluginRegistration | undefined {
    return usePluginStore.getState().registeredPlugins[pluginId];
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginRegistration[] {
    return Object.values(usePluginStore.getState().registeredPlugins);
  }

  /**
   * Get plugins filtered by category
   */
  getPluginsByCategory(category: string): PluginRegistration[] {
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  /**
   * Register a function that can execute a step
   */
  registerStepExecutor(
    stepId: string, 
    executor: (context: TaskContext) => Promise<any>
  ): void {
    this.stepExecutors[stepId] = executor;
  }

  /**
   * Unregister a step executor
   */
  unregisterStepExecutor(stepId: string): void {
    delete this.stepExecutors[stepId];
  }

  /**
   * Execute a step by its ID with the given context
   */
  async executeStep(
    stepId: string, 
    context: TaskContext
  ): Promise<{
    success: boolean;
    result?: Record<string, any>;
    error?: string;
    contextUpdates?: Partial<TaskContext>;
  }> {
    const { registeredPlugins } = usePluginStore.getState();
    
    // Find the step first
    // Note: In a real app, you'd need to store steps somewhere
    const step = window.appSteps?.find(s => s.id === stepId);
    
    if (!step) {
      return {
        success: false,
        error: `Step not found: ${stepId}`
      };
    }
    
    // Get the plugin for this step type
    const plugin = registeredPlugins[step.type];
    
    if (!plugin) {
      return {
        success: false,
        error: `No registered plugin for step type ${step.type}`
      };
    }

    try {
      // Validate step first
      const validation = this.validateStep(step, context);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Step validation failed'
        };
      }
      
      // Check if we have a registered executor for this step
      if (this.stepExecutors[stepId]) {
        try {
          // Call the registered executor
          const result = await this.stepExecutors[stepId](context);
          return {
            success: true,
            ...result
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      // Execute plugin-specific logic if it exists
      if (plugin.api?.executeStep) {
        const result = await plugin.api.executeStep(step, context);
        return {
          success: true,
          result: result.data,
          contextUpdates: result.contextUpdates
        };
      }
      
      // Otherwise use the default behavior
      // This would be whatever your app defines as the default
      return {
        success: false,
        error: `Plugin ${plugin.id} does not implement executeStep and no executor is registered`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate a step configuration
   */
  validateStep(
    step: StepConfig, 
    context: TaskContext
  ): { valid: boolean; error?: string } {
    const { registeredPlugins } = usePluginStore.getState();
    
    const plugin = registeredPlugins[step.type];
    
    if (!plugin) {
      return { 
        valid: false, 
        error: `Unknown plugin type: ${step.type}` 
      };
    }
    
    return plugin.validate(step, context);
  }
  
  /**
   * Disable a plugin by ID
   */
  disablePlugin(pluginId: string): void {
    usePluginStore.getState().disablePlugin(pluginId);
  }
  
  /**
   * Enable a plugin by ID
   */
  enablePlugin(pluginId: string): void {
    usePluginStore.getState().enablePlugin(pluginId);
    
    // The plugin should be reloaded
    const { installedPlugins } = usePluginStore.getState();
    if (installedPlugins[pluginId]) {
      import('./dynamicLoader')
        .then(({ loadPluginFromUrl }) => {
          loadPluginFromUrl(installedPlugins[pluginId].path);
        })
        .catch(console.error);
    }
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();

// For global access
declare global {
  interface Window {
    pluginManager: PluginManager;
    appSteps?: StepConfig[];
  }
}

// Expose to window for plugin access
window.pluginManager = pluginManager;