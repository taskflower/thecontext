// src/plugin-system/loadPlugin.ts
import { PluginModule } from './types';

// Dynamic plugin loader
export const loadPlugin = async (url: string): Promise<PluginModule> => {
  try {
    // For development environment
    if (import.meta.env.DEV) {
      // In Vite, use import.meta.env instead of process.env
      // In dev mode, you might load from a local path or dev server
      const module = await import(/* @vite-ignore */ url);
      return module.default || module;
    } 
    
    // For production environment
    else {
      // Fetch the plugin code as text
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin from ${url}`);
      }
      
      const pluginCode = await response.text();
      
      // Create a blob URL for the plugin code
      const blob = new Blob([pluginCode], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);
      
      // Import the plugin dynamically
      const module = await import(/* @vite-ignore */ blobURL);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobURL);
      
      return module.default || module;
    }
  } catch (error) {
    console.error('Failed to load plugin:', error);
    throw error;
  }
};
