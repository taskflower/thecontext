/**
 * Core type definitions for The Context App
 */

// Entity Types Constants
export const ENTITY_TYPES = {
  WORKSPACE: 'workspace',
  SCENARIO: 'scenario',
  NODE: 'node',
  EDGE: 'edge',
  CONTEXT: 'context'
};

// Basic entity interfaces
export interface BaseEntity {
  id: string;
  type: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Workspace extends BaseEntity {
  name: string;
  description?: string;
  scenarios: Scenario[];
}

export interface Scenario extends BaseEntity {
  workspaceId: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Node extends BaseEntity {
  scenarioId: string;
  label: string;
  description?: string;
  position: { x: number, y: number };
  assistantMessage?: string;
  userPrompt?: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
}

export interface Edge extends BaseEntity {
  scenarioId: string;
  source: string;
  target: string;
  label?: string;
}

export interface ContextItem extends BaseEntity {
  workspaceId: string;
  title: string;
  contentType: string;
  content: string;
  persistent?: boolean;
}

// Plugin types
export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  type: 'editor' | 'step' | 'system';
  hookPoints?: string[];
}

// Template types
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  components: Record<string, React.ComponentType<any>>;
}