// src/types/template.ts
import { PluginConfig, PluginRuntimeData } from "@/plugins/base";

export interface Step {
  id: string;
  name: string;
  description: string;
  pluginId: string;
  data: PluginRuntimeData;
  config: PluginConfig;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  createdAt: Date;
  updatedAt: Date;
}