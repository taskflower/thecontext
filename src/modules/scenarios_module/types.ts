// src/modules/scenarios_module/types.ts
// Update the Node interface to store plugin configuration

import { Template } from '../templates_module/templateStore';
import { PluginConfig } from '../plugins_system/types';

export interface Node {
  id: string;
  message: string;
  category: string;
  templateData?: Template; // For template nodes
  pluginId?: string; // ID of the associated plugin
  pluginConfig?: PluginConfig; // Node-specific plugin configuration
}

export interface Edge {
  source: string;
  target: string;
}