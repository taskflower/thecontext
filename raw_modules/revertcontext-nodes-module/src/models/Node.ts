// src/models/Node.ts
// Klasa węzła przepływu

import { NodeData, Position } from '../types/NodeTypes';

/**
 * Reprezentuje pojedynczy węzeł w przepływie aplikacji
 */
export class Node implements NodeData {
  id: string;
  scenarioId: string;
  type: string;
  label: string;
  description: string;
  position: Position;
  assistantMessage: string;
  userPrompt: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  includeSystemMessage?: boolean;
  templateId?: string;
  formFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;

  constructor(data: NodeData) {
    this.id = data.id || `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.scenarioId = data.scenarioId;
    this.type = data.type || 'node';
    this.label = data.label;
    this.description = data.description || '';
    this.position = data.position || { x: 0, y: 0 };
    this.assistantMessage = data.assistantMessage || '';
    this.userPrompt = data.userPrompt || '';
    this.contextKey = data.contextKey;
    this.contextJsonPath = data.contextJsonPath;
    this.pluginKey = data.pluginKey;
    this.pluginData = data.pluginData;
    this.includeSystemMessage = data.includeSystemMessage;
    this.templateId = data.templateId;
    this.formFields = data.formFields;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  /**
   * Aktualizuje dane węzła
   */
  update(data: Partial<NodeData>): Node {
    Object.assign(this, {
      ...data,
      updatedAt: new Date()
    });
    return this;
  }

  /**
   * Konwertuje węzeł do JSON
   */
  toJSON(): NodeData {
    return {
      id: this.id,
      scenarioId: this.scenarioId,
      type: this.type,
      label: this.label,
      description: this.description,
      position: this.position,
      assistantMessage: this.assistantMessage,
      userPrompt: this.userPrompt,
      contextKey: this.contextKey,
      contextJsonPath: this.contextJsonPath,
      pluginKey: this.pluginKey,
      pluginData: this.pluginData,
      includeSystemMessage: this.includeSystemMessage,
      templateId: this.templateId,
      formFields: this.formFields,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Tworzy kopię węzła
   */
  clone(): Node {
    return new Node(this.toJSON());
  }
}