/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts
export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  
  export interface LLMRequest {
    messages: LLMMessage[];
    userId: string;
    model?: string;
    options?: Record<string, any>;
  }
  
  export interface LLMResponse {
    content: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }
  
  export type Priority = 'low' | 'medium' | 'high';
  export type StepType = 'retrieval' | 'processing' | 'generation' | 'validation' | 'custom';
  
  export interface IGeneratedSetup {
    projectName: string;
    containers: Array<{
      name: string;
      documents?: Array<{
        title: string;
        content: string;
      }>;
    }>;
    templates: Array<{
      name: string;
      description: string;
      defaultPriority: Priority;
      defaultSteps: Array<{
        order: number;
        type: StepType;
        description: string;
      }>;
    }>;
    initialTask?: {
      title: string;
      description: string;
      priority: Priority;
      containerId?: string;
    };
  }
  
  export interface IPromptConfig {
    systemPrompt: string;
    userPromptTemplate: string;
    model?: string;
    modelOptions?: Record<string, any>;
  }
  
  export interface IExternalPromptConfig {
    baseSystemPrompt?: string;
    userPromptTemplate: string;
    model?: string;
    modelOptions?: Record<string, any>;
    responseHandler?: (response: any, context: ExecutionContext) => Promise<boolean>;
  }
  
  export interface ActionType {
    type: string;
    data: any;
  }
  
  export interface IEntityMapping {
    entityType: string;
    sourcePath: string;
    fieldMapping: Record<string, string>;
  }
  
  export interface IResponseAction {
    type: string;
    entityMappings?: IEntityMapping[];
    customHandler?: string;
    customConfig?: Record<string, any>;
  }
  
  export interface IExecutionPlan {
    projectId: string;
    actions: Array<{
      type: string;
      data: any;
    }>;
  }
  
  export interface ExecutionContext {
    taskId: string;
    stepId: string;
    projectId: string;
    [key: string]: any;
  }