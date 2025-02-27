/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/registry/actionTypeRegistry.ts

import { ActionType } from "../response/responseTypes";


export interface ActionTypeHandler {
  executeFunction: (projectId: string, data: any) => Promise<any>;
  validateData?: (data: any) => boolean;
}

class ActionTypeRegistry {
  private handlers: Map<ActionType, ActionTypeHandler> = new Map();
  
  register(type: ActionType, handler: ActionTypeHandler): void {
    this.handlers.set(type, handler);
  }
  
  getHandler(type: ActionType): ActionTypeHandler | undefined {
    return this.handlers.get(type);
  }
  
  hasHandler(type: ActionType): boolean {
    return this.handlers.has(type);
  }
}

export const actionTypeRegistry = new ActionTypeRegistry();