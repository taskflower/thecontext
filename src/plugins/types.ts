/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Types for the plugin system
 */
import React from 'react';
import { Node } from '../core/types';

// Plugin manifest
export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  type: 'editor' | 'step' | 'system';
  hookPoints?: string[];
  dependencies?: string[];
}

// Plugin component props
export interface PluginComponentProps {
  id: string;
  data?: Record<string, any>;
  className?: string;
}

// Step plugin props
export interface StepPluginProps extends PluginComponentProps {
  node: Node;
  onContinue?: () => void;
  processTemplate?: (text: string) => string;
  onContextUpdate?: (key: string, value: any) => void;
  getContextValue?: (key: string, path?: string) => any;
}

// Editor plugin props
export interface EditorPluginProps extends PluginComponentProps {
  node: Node;
  onNodeUpdate?: (nodeUpdates: Partial<Node>) => void;
}

// Hook point plugin props
export interface HookPointPluginProps extends PluginComponentProps {
  hookPoint: string;
  position: 'before' | 'after' | 'replace';
  priority?: number;
}

// Plugin registration
export interface PluginRegistration {
  manifest: PluginManifest;
  components: {
    [componentId: string]: React.ComponentType<any>;
  };
}

// Plugin registry
export interface PluginRegistry {
  [pluginId: string]: PluginRegistration;
}

// Plugin context
export interface PluginContextValue {
  plugins: PluginRegistry;
  registerPlugin: (plugin: PluginRegistration) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => PluginRegistration | undefined;
  getPluginComponent: (pluginId: string, componentId: string) => React.ComponentType<any> | undefined;
}