/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/examplePlugin/index.ts

import { ExampleEditor } from './ExampleEditor';
import { ExampleViewer } from './ExampleViewer';
import { ExampleResult } from './ExampleResult';
import { PluginManifest, PluginRegistration } from '../types';
import { registerPlugin } from '../registry';

// Plugin manifest
export const manifest: PluginManifest = {
  id: 'example-input',
  name: 'Example Input',
  version: '1.0.0',
  description: 'A simple example plugin for the system',
  author: 'Your Name',
  repository: 'https://github.com/yourusername/plugin-repo',
  minAppVersion: '1.0.0'
};

// Register function that will be called when the plugin is loaded
export function register(context?: any): PluginRegistration {
  const registration = {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: 'examples',
    icon: null,
    
    capabilities: {
      autoExecutable: false,
      requiresUserInput: true,
      producesOutput: true,
      consumesOutput: false
    },
    
    defaultConfig: {
      label: 'Example Input',
      placeholder: 'Enter something...',
      required: true
    },
    
    EditorComponent: ExampleEditor,
    ViewerComponent: ExampleViewer,
    ResultComponent: ExampleResult,
    
    validate: (step, context) => {
      return { valid: true };
    },
    
    manifest
  };
  
  // Register plugin with the registry
  registerPlugin(registration);
  
  return registration;
}

// Default export
export default {
  register,
  manifest
};