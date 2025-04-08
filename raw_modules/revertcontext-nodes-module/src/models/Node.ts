/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/Node.ts
import { NodeData, Position } from '../types';

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
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  update(data: Partial<NodeData>): Node {
    Object.assign(this, {
      ...data,
      updatedAt: new Date()
    });
    return this;
  }

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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  clone(): Node {
    return new Node(this.toJSON());
  }
}