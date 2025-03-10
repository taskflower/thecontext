// src/modules/scenarios_module/types.ts
import { Template } from '../templates_module/templateStore';

export interface Node {
  id: string;
  message: string;
  category: string;
  templateData?: Template; // For template nodes
}

export interface Edge {
  source: string;
  target: string;
}