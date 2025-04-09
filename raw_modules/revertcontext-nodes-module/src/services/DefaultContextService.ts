// src/services/DefaultContextService.ts
// Domyślna implementacja serwisu kontekstowego

import { ContextService } from './ContextService';

/**
 * Domyślna implementacja serwisu kontekstowego używająca modułu context-manager
 */
export class DefaultContextService implements ContextService {
  private contextManager: any;

  constructor(contextManager: any) {
    this.contextManager = contextManager;
  }

  getContext(): Record<string, any> {
    return this.contextManager.getContext();
  }

  updateContext(key: string, value: any, jsonPath?: string): Record<string, any> {
    return this.contextManager.updateContext(key, value, jsonPath);
  }

  processTemplate(template: string): string {
    return this.contextManager.processTemplate(template);
  }

  getValue(key: string, jsonPath?: string): any {
    return this.contextManager.getValue(key, jsonPath);
  }
}
