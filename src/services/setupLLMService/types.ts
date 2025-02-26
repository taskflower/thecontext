// src/services/setupLLMService/types.ts
export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  userId: string;
}

export interface LLMResponse {
  content: string;
}

export type Priority = "low" | "medium" | "high";
export type StepType = "retrieval" | "processing" | "generation" | "validation" | "custom";

export interface Document {
  title: string;
  content: string;
}

export interface Container {
  name: string;
  documents?: Document[];
}

export interface Step {
  order: number;
  type: StepType;
  description: string;
}

export interface Template {
  name: string;
  description: string;
  defaultPriority: Priority;
  defaultSteps: Step[];
}

export interface Task {
  title: string;
  description: string;
  priority: Priority;
  containerId?: string;
}

export interface IGeneratedSetup {
  projectName: string;
  containers: Container[];
  templates: Template[];
  initialTask?: Task;
}