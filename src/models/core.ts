/**
 * Core Models
 * Base types for the refactored architecture
 */

// Entity types constants
export const ENTITY_TYPES = {
  WORKSPACE: 'workspace',
  SCENARIO: 'scenario',
  NODE: 'node',
  EDGE: 'edge',
  CONTEXT: 'context'
};

// Base entity interface
export interface BaseEntity {
  id: string;
  type: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

// Workspace entity
export interface Workspace extends BaseEntity {
  name: string;
  description?: string;
  scenarios: Scenario[];
}

// Scenario entity
export interface Scenario extends BaseEntity {
  workspaceId: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  template?: string;
}

// Node entity
export interface Node extends BaseEntity {
  scenarioId: string;
  label?: string;
  description?: string;
  position: { x: number, y: number };
  assistantMessage?: string;
  userPrompt?: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
}

// Edge entity
export interface Edge extends BaseEntity {
  scenarioId: string;
  source: string;
  target: string;
  label?: string;
}

// Context item entity
export interface ContextItem extends BaseEntity {
  workspaceId: string;
  title: string;
  contentType: string;
  content: string;
  persistent?: boolean;
}