/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/projectTypes.ts

export interface IProject {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
    containers: string[]; // Container IDs
    templates: string[]; // Template IDs
    setupCompleted?: boolean;
    customFields?: Record<string, any>;
  }
  
  // Project store state
  export interface IProjectState {
    projects: IProject[];
    currentProject: IProject | null;
  }
  
  // LLM-generated setup types
  export interface IGeneratedSetupContainer {
    name: string;
    documents?: Array<{
      title: string;
      content: string;
    }>;
  }
  
  export interface IGeneratedSetupTemplate {
    name: string;
    description: string;
    defaultPriority: "low" | "medium" | "high";
    defaultSteps: Array<{
      order: number;
      type: "retrieval" | "processing" | "generation" | "validation" | "custom";
      description: string;
    }>;
  }
  
  export interface IGeneratedSetupTask {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    containerId?: string;
  }
  
  export interface IGeneratedSetup {
    projectName: string;
    containers: IGeneratedSetupContainer[];
    templates: IGeneratedSetupTemplate[];
    initialTask?: IGeneratedSetupTask;
  }
  
  // Project statistics type
  export interface IProjectStats {
    totalContainers: number;
    totalDocuments: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    failedTasks: number;
  }