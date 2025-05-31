// src/core/types.ts - Stronger typing
import { ComponentType } from "react";
import { ZodType } from "zod";

export type ThemeType = "steps" | "widgets" | "layouts";

export interface ComponentHookResult<T = any> {
  Component: ComponentType<T> | null;
  loading: boolean;
  error: string | null;
}

export interface ConfigRecord {
  id: string;
  data: any;
  updatedAt: Date;
}

// Stronger typing for schema properties
export interface SchemaProperty {
  type: "string" | "number" | "boolean";
  label: string;
  fieldType: "text" | "textarea" | "select" | "email" | "date" | "checkbox" | "number";
  required: boolean;
  enum?: string[];
  enumLabels?: Record<string, string>;
  enumHints?: Record<string, string>;
  default?: any;
  minimum?: number;
  maximum?: number;
  aiHint?: string;
}

export interface ContextSchema {
  type: "object";
  properties: Record<string, SchemaProperty>;
}

export interface WorkspaceConfig {
  slug?: string;
  name: string;
  templateSettings: {
    layoutFile: string;
    parentClass?: string;  
    widgets: Array<{
      tplFile: string;
      title: string;
      attrs: Record<string, any>;
    }>;
  };
  contextSchema: Record<string, ContextSchema>;
}

// Scenario configuration types
export interface ScenarioNode {
  slug: string;
  label: string;
  order: number;
  tplFile: string;
  attrs: {
    title?: string;
    schemaPath: string;
    collection?: string;
    loadFromParams?: boolean;
    excludeFields?: string[];
    onSubmit?: {
      collection: string;
      navURL: string;
      action?: "create" | "update";
    };
    // LLM specific
    description?: string;
    placeholder?: string;
    contextInstructions?: string;
    examplePrompts?: string[];
    navURL?: string;
    cancelnavURL?: string;
    systemMessage?: string;
    // List specific
    emptyState?: {
      icon?: string;
      title?: string;
      description?: string;
      actionButton?: { title: string; navURL: string };
    };
    columns?: Array<{
      key: string;
      label?: string;
      type?: "text" | "badge" | "date" | "enum";
      width?: string;
      sortable?: boolean;
    }>;
    actions?: Array<{
      type: "edit" | "delete" | "custom";
      label?: string;
      navURL?: string;
      confirm?: string;
      variant?: "default" | "danger";
    }>;
    widgets?: Array<{
      tplFile: string;
      title: string;
      attrs: { navURL: string; variant?: "primary" | "secondary" };
    }>;
    pagination?: { pageSize?: number; showTotal?: boolean };
    search?: { enabled?: boolean; placeholder?: string; fields?: string[] };
    sorting?: { enabled?: boolean; defaultField?: string; defaultDirection?: "asc" | "desc" };
  };
}

export interface ScenarioConfig {
  slug: string;
  nodes: ScenarioNode[];
}

export interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
  database: {
    provider: string;
    collections: Record<string, string>;
  };
}

// Updated FlowState - ONLY for context data
export interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmOptions<T> {
  schema?: ZodType<T>;
  jsonSchema?: any;
  userMessage: string;
  systemMessage?: string;
  autoStart?: boolean;
  apiEndpoint?: string;
}

export interface LlmHookResult<T> {
  isLoading: boolean;
  error: string | null;
  result: T | null;
  started: boolean;
  start: () => Promise<void>;
  setStarted: (value: boolean) => void;
}

export interface SchemaHookResult {
  schema: ContextSchema | null;
  loading: boolean;
  error: string | null;
}