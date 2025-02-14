/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/base.ts
import React from "react";
import { MessageRole } from "@/types/common";
import { Step } from "@/types/template";

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface PluginStepContext {
  user: any;
  currentStep: number;
  totalSteps: number;
  previousSteps: PluginRuntimeData[];
  availableSteps: Step[];
}

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginRuntimeData {
  [key: string]: any;
}

export interface PluginConfigProps {
  config: PluginConfig;
  context?: PluginStepContext;
  onConfigChange: (config: PluginConfig) => void;
  onStatusChange: (isValid: boolean) => void;
}

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
  icon?: React.ReactNode;
  ConfigComponent: React.ComponentType<PluginConfigProps>;
  RuntimeComponent: React.ComponentType<PluginRuntimeProps>;
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