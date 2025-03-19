/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/types.ts
import React from 'react';
import { ComponentType } from '.';


export interface PluginOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  default?: any;
  options?: Array<{ value: string; label: string }>;
}

// Interface for user input processing
export interface UserInputProcessorContext {
  currentValue: string;
  options: Record<string, any>;
  onChange: (newValue: string) => void;
  provideCustomRenderer: (renderer: React.ReactNode) => void;
}

export interface Plugin {
  // Plugin metadata
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Configuration options
  options?: PluginOption[];
  
  // Component overrides for UI customization
  overrideComponents?: {
    [key in ComponentType]?: React.ComponentType<any>;
  };
  
  // Message processing functions
  process: (text: string, options?: Record<string, any>) => Promise<string>;
  processUserInput?: (context: UserInputProcessorContext) => Promise<string | void>;
}