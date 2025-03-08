/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/dynamicLoader.ts
import { usePluginStore } from './store/pluginStore';
import { PluginRegistration, PluginManifest } from './types';

interface PluginModule {
  default: {
    register: (context?: any) => PluginRegistration;
    manifest: PluginManifest;
  }
}

// Proxy object to provide plugins with controlled access to app features
const pluginContext = {
  store: {
    // Provide a limited API to plugins
    getState: () => {
      const state = usePluginStore.getState();
      // Return only what plugins should be allowed to access
      return {
        // Add any state you want plugins to access
      };
    },
    subscribe: (selector: (state: any) => any, callback: (selectedState: any) => void) => {
      return usePluginStore.subscribe(selector, callback);
    }
  },
  // Add other APIs you want to expose to plugins
  api: {
    // Example API methods plugins can use
  }
};

/**
 * Load a plugin from a URL dynamically using a script tag approach
 */
export async function loadPluginFromUrl(url: string): Promise<PluginRegistration | null> {
  try {
    // Set loading state
    usePluginStore.getState().setLoading(true);
    usePluginStore.getState().setError(null);
    
    // Create a unique ID for this plugin load
    const pluginLoadId = `plugin-load-${Date.now()}`;
    
    // Create a Promise that will resolve when the plugin is loaded
    const pluginLoadPromise = new Promise<PluginModule>((resolve, reject) => {
      // Add a listener for the plugin load event
      window[pluginLoadId] = (pluginModule: PluginModule) => {
        resolve(pluginModule);
      };
      
      // Create a script element
      const script = document.createElement('script');
      script.type = 'module';
      // Append a cache-busting query parameter
      const cacheBuster = `?t=${Date.now()}`;
      script.textContent = `
        import * as pluginModule from '${url}${cacheBuster}';
        window['${pluginLoadId}'](pluginModule);
      `;
      
      // Handle script load errors
      script.onerror = () => {
        reject(new Error(`Failed to load plugin from ${url}`));
      };
      
      // Set a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Plugin load timeout'));
        document.head.removeChild(script);
      }, 10000);
      
      // Add the script to the document
      document.head.appendChild(script);
      
      // Clean up the script when done
      script.onload = () => {
        clearTimeout(timeoutId);
      };
    });
    
    // Wait for the plugin to load
    const pluginModule = await pluginLoadPromise;
    
    // Clean up the global function
    delete window[pluginLoadId];
    
    if (!pluginModule.default || typeof pluginModule.default.register !== 'function') {
      throw new Error('Invalid plugin format - missing register function');
    }
    
    // Extract plugin manifest
    const manifest = pluginModule.default.manifest;
    if (!manifest || !manifest.id || !manifest.version) {
      throw new Error('Invalid plugin manifest');
    }
    
    // Create a sandbox function to register the plugin
    const registerPlugin = () => {
      try {
        // Call the register function with our plugin context
        const registration = pluginModule.default.register(pluginContext);
        
        // Store the registration
        usePluginStore.getState().registerPlugin(registration);
        
        // Mark as installed
        usePluginStore.getState().installPlugin(
          manifest.id,
          manifest.version,
          url
        );
        
        return registration;
      } catch (error) {
        console.error('Error registering plugin:', error);
        usePluginStore.getState().setError(`Failed to register plugin: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    };
    
    // Execute registration
    return registerPlugin();
  } catch (error) {
    console.error('Error loading plugin:', error);
    usePluginStore.getState().setError(`Failed to load plugin: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  } finally {
    usePluginStore.getState().setLoading(false);
  }
}

/**
 * Load all installed plugins from storage
 */
export async function loadInstalledPlugins(): Promise<void> {
  const { installedPlugins, isLoading } = usePluginStore.getState();
  
  // Don't load if already loading
  if (isLoading) return;
  
  // Set loading state
  usePluginStore.getState().setLoading(true);
  
  try {
    // Load each installed plugin
    const enabledPlugins = Object.values(installedPlugins)
      .filter(plugin => plugin.enabled);
    
    // Load plugins in sequence to avoid race conditions
    for (const plugin of enabledPlugins) {
      await loadPluginFromUrl(plugin.path);
    }
  } catch (error) {
    console.error('Error loading installed plugins:', error);
    usePluginStore.getState().setError(`Failed to load installed plugins: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    usePluginStore.getState().setLoading(false);
  }
}

/**
 * Initialize plugins on application start
 */
export function initializePlugins(): void {
  // Load installed plugins
  loadInstalledPlugins();
}

/**
 * Reload a plugin by ID
 */
export async function reloadPlugin(pluginId: string): Promise<boolean> {
  const { installedPlugins } = usePluginStore.getState();
  
  const plugin = installedPlugins[pluginId];
  if (!plugin) return false;
  
  try {
    // Unregister first
    usePluginStore.getState().unregisterPlugin(pluginId);
    
    // Then load again
    await loadPluginFromUrl(plugin.path);
    return true;
  } catch (error) {
    console.error(`Error reloading plugin ${pluginId}:`, error);
    return false;
  }
}