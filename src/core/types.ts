// src/core/types.ts
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

export interface WorkspaceConfig {
  contextSchema?: Record<string, any>;
}

export interface FlowState {
  data: Record<string, any>;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  reset: () => void;
  getAll: (prefix: string) => Promise<any[]>;
  addRecord: (id: string, data: any) => Promise<void>;
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

export interface LocalStoreHook<T> {
  items: T[];
  add: (data: T) => void;
}

export interface SchemaHookResult {
  schema: any;
  loading: boolean;
  error: string | null;
}
