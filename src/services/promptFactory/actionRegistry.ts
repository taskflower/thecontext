/* eslint-disable @typescript-eslint/no-explicit-any */
// actionRegistry.ts

import { entityFactory } from "./entityFactory";



interface ActionHandler {
  executeFunction: (projectId: string, data: any) => Promise<string | null | boolean>;
}

class ActionTypeRegistry {
  private handlers: Record<string, ActionHandler> = {};
  
  constructor() {
    // Rejestruj domyślne handlery
    this.registerEntityHandlers();
  }
  
  private registerEntityHandlers() {
    this.registerHandler('create_container', {
      executeFunction: entityFactory.createContainer
    });
    
    this.registerHandler('create_document', {
      executeFunction: entityFactory.createDocument
    });
    
    this.registerHandler('create_task', {
      executeFunction: entityFactory.createTask
    });
    
    this.registerHandler('create_template', {
      executeFunction: entityFactory.createTemplate
    });
    
    this.registerHandler('update_project', {
      executeFunction: entityFactory.updateProject
    });
  }
  
  registerHandler(type: string, handler: ActionHandler): void {
    this.handlers[type] = handler;
  }
  
  hasHandler(type: string): boolean {
    return !!this.handlers[type];
  }
  
  getHandler(type: string): ActionHandler | null {
    return this.handlers[type] || null;
  }
  
  // Metoda do rejestracji niestandardowego handlera
  registerCustomHandler(
    type: string, 
    handlerFn: (projectId: string, data: any) => Promise<string | null | boolean>
  ): void {
    this.registerHandler(type, {
      executeFunction: handlerFn
    });
  }
}

export const actionTypeRegistry = new ActionTypeRegistry();