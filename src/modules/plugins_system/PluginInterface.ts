/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins_system/PluginInterface.ts
// Uproszczony interfejs pluginu z zachowaniem funkcjonalności

import React from 'react';
import { Node } from '../scenarios_module/types';

export interface PluginProps {
  nodeId?: string;
  config?: Record<string, any>;
  onConfigChange?: (updates: Record<string, any>) => void;
  onResponseChange?: (response: string) => void;
}

export interface PluginModule {
  id: string;
  name: string;
  description?: string;
  defaultConfig?: Record<string, any>;
  
  ViewComponent: React.FC<PluginProps>;
  ConfigComponent: React.FC<PluginProps>;
  ResultComponent: React.FC<PluginProps>;

  processNode?: (node: Node, response?: string) => { node: Node, result: any };
}

export abstract class PluginBase implements PluginModule {
  id: string;
  name: string;
  description: string;
  defaultConfig: Record<string, any>;
  
  constructor(id: string, name: string, description: string = '') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.defaultConfig = {};
  }
  
  abstract ViewComponent: React.FC<PluginProps>;
  abstract ConfigComponent: React.FC<PluginProps>;
  abstract ResultComponent: React.FC<PluginProps>;
  
  processNode(node: Node, response?: string): { node: Node, result: any } {
    return { node, result: response || null };
  }
}