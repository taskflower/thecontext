/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/base.ts
import { MessageRole } from "@/types/common";

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface PluginStepContext {
  currentStep: number;
  totalSteps: number;
  previousSteps: PluginRuntimeData[];
}

// Base interface for plugin configuration
export interface PluginConfig {
  [key: string]: any;
}

// Base interface for runtime data
export interface PluginRuntimeData {
  [key: string]: any;
}

// Props for configuration component
export interface PluginConfigProps {
  config: PluginConfig;
  onConfigChange: (config: PluginConfig) => void;
  onStatusChange: (isValid: boolean) => void;
}

// Props for runtime component
export interface PluginRuntimeProps {
  config: PluginConfig;
  data: PluginRuntimeData;
  context: PluginStepContext;
  onDataChange: (data: PluginRuntimeData) => void;
  onStatusChange: (isValid: boolean) => void;
}

export interface PluginDefinition {
  id: string;
  name: string;
  description: string;

  // UI Components
  ConfigComponent: React.ComponentType<PluginConfigProps>;
  RuntimeComponent: React.ComponentType<PluginRuntimeProps>;

  // Logic
  initialize?: (config?: PluginConfig) => Promise<void>;
  validate: (
    config: PluginConfig,
    data?: PluginRuntimeData
  ) => Promise<boolean>;
  generateMessages: (
    config: PluginConfig,
    data: PluginRuntimeData
  ) => LLMMessage[];
}

export type PluginMap = Record<string, PluginDefinition>;
