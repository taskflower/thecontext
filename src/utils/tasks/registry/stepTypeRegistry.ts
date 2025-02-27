/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/registry/stepTypeRegistry.ts

import { StepType } from "@/services/setupLLMService/types";


export interface StepTypeHandler {
  renderComponent: React.ComponentType<any>;
  editorComponent: React.ComponentType<any>;
  executeFunction: (taskId: string, stepId: string) => Promise<any>;
  validateConfig?: (config: any) => boolean;
}

class StepTypeRegistry {
  private handlers: Map<StepType, StepTypeHandler> = new Map();
  
  register(type: StepType, handler: StepTypeHandler): void {
    this.handlers.set(type, handler);
  }
  
  getHandler(type: StepType): StepTypeHandler | undefined {
    return this.handlers.get(type);
  }
  
  hasHandler(type: StepType): boolean {
    return this.handlers.has(type);
  }
  
  getRegisteredTypes(): StepType[] {
    return Array.from(this.handlers.keys());
  }
}

export const stepTypeRegistry = new StepTypeRegistry();

// Inicjalizacja podstawowych typów zostanie wykonana w oddzielnym pliku