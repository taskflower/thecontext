/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins_system/PluginInterface.ts
// Uproszczony interfejs pluginu z zachowaniem funkcjonalności

import React from 'react';
import { Node } from '../scenarios_module/types';

// Wspólne props dla wszystkich komponentów pluginu
export interface PluginProps {
  nodeId?: string;
  config?: Record<string, any>;
  onConfigChange?: (updates: Record<string, any>) => void;
  onResponseChange?: (response: string) => void;
}

// Interfejs pluginu - minimalna wymagana struktura
export interface PluginModule {
  id: string;
  name: string;
  description?: string;
  defaultConfig?: Record<string, any>;
  
  // Komponenty UI pluginu
  ViewComponent: React.FC<PluginProps>;
  ConfigComponent: React.FC<PluginProps>;
  ResultComponent: React.FC<PluginProps>;
  
  // Opcjonalne metody
  processNode?: (node: Node, response?: string) => { node: Node, result: any };
}

// Bazowa klasa dla pluginów
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
  
  // Domyślna implementacja przetwarzania węzła
  processNode(node: Node, response?: string): { node: Node, result: any } {
    return { node, result: response || null };
  }
}