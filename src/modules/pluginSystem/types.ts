/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/types.ts
import { ReactNode } from 'react';

/**
 * Base interface for all task data that can be shared between steps
 */
export interface TaskContext {
  [key: string]: any;
}

/**
 * Step execution status
 */
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'error';

/**
 * Base interface for a workflow step configuration
 */
export interface StepConfig {
  id: string;
  type: string;
  title: string;
  description?: string;
  taskId: string;
  order: number;
  status: StepStatus;
  data?: Record<string, any>; // Step-specific configuration
  result?: Record<string, any> | null; // Step execution result
}

/**
 * Props passed to step editor component
 */
export interface StepEditorProps {
  step: StepConfig;
  onChange: (updates: Partial<StepConfig>) => void;
}

/**
 * Props passed to step viewer (execution) component
 */
export interface StepViewerProps {
  step: StepConfig;
  context: TaskContext;  
  onComplete: (result: Record<string, any>, contextUpdates?: Partial<TaskContext>) => void;
  onError: (error: string) => void;
}

/**
 * Props passed to step result viewer component
 */
export interface StepResultProps {
  step: StepConfig;
  context: TaskContext;
}

/**
 * Plugin manifest for identification and versioning
 */
export interface PluginManifest {
  id: string;                // Unique identifier
  name: string;              // Display name  
  version: string;           // Semantic version
  description: string;       // Description
  author: string;            // Author name
  repository?: string;       // Optional repository URL
  dependencies?: string[];   // Optional dependencies (other plugin IDs)
  minAppVersion?: string;    // Minimum app version required
}

/**
 * Step plugin definition
 */
export interface PluginDefinition {
  id: string;                     // Unique identifier for the plugin
  name: string;                   // Display name
  description: string;            // Description of what the plugin does
  icon?: ReactNode;               // Optional icon component
  category: string;               // Category for organization
  
  // Plugin capabilities
  capabilities: {
    autoExecutable: boolean;      // Can be executed automatically
    requiresUserInput: boolean;   // Requires user interaction
    producesOutput: boolean;      // Produces data for other steps
    consumesOutput: boolean;      // Requires data from other steps
  };
  
  // Default config when creating a new step of this type
  defaultConfig: Record<string, any>;
  
  // Validation function for the step configuration
  validate: (step: StepConfig, context: TaskContext) => { 
    valid: boolean; 
    error?: string;
  };
}

/**
 * Plugin registry entry containing plugin definition and components
 */
export interface PluginRegistration extends PluginDefinition {
  // Components
  EditorComponent: React.ComponentType<StepEditorProps>;
  ViewerComponent: React.ComponentType<StepViewerProps>;
  ResultComponent: React.ComponentType<StepResultProps>;
  
  // Manifest with version information
  manifest: PluginManifest;
  
  // Optional plugin-specific APIs
  api?: Record<string, any>;
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  registerPlugin: (plugin: PluginRegistration) => void;
  getPlugin: (pluginId: string) => PluginRegistration | undefined;
  getAllPlugins: () => PluginRegistration[];
  getPluginsByCategory: (category: string) => PluginRegistration[];
  executeStep: (stepId: string, context: TaskContext) => Promise<{
    success: boolean;
    result?: Record<string, any>;
    error?: string;
    contextUpdates?: Partial<TaskContext>;
  }>;
  validateStep: (step: StepConfig, context: TaskContext) => { 
    valid: boolean; 
    error?: string;
  };
}

/**
 * Plugin installation source
 */
export enum PluginSource {
  LOCAL = 'local',         // Local file system
  MARKETPLACE = 'marketplace', // App marketplace
  URL = 'url',             // Direct URL
  MANUAL = 'manual'        // Manually installed
}

/**
 * Plugin installation info
 */
export interface PluginInstallInfo {
  id: string;
  version: string;
  source: PluginSource;
  installedAt: Date;
  path: string;
  enabled: boolean;
}