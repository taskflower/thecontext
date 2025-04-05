/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Flow Context Handler
 * Manages context values for the flow execution
 */
import { ContextItem } from '../core/services/contextProcessor';

interface ContextEventHandlers {
  onContextUpdate?: (key: string, value: any, path?: string) => void;
  onContextRead?: (key: string, path?: string) => void;
}

/**
 * Context handler for flows
 * Manages the flow's context values, including user inputs
 */
class FlowContextHandler {
  private contextItems: ContextItem[];
  private userInputs: Record<string, string>;
  private handlers: ContextEventHandlers;

  constructor(initialContext: ContextItem[] = [], eventHandlers: ContextEventHandlers = {}) {
    this.contextItems = initialContext;
    this.userInputs = {};
    this.handlers = eventHandlers;
  }

  /**
   * Get all context items
   */
  public getContextItems(): ContextItem[] {
    return this.contextItems;
  }

  /**
   * Get all user inputs
   */
  public getUserInputs(): Record<string, string> {
    return this.userInputs;
  }

  /**
   * Set a user input value
   */
  public setUserInput(key: string, value: string): void {
    this.userInputs[key] = value;
    
    // Trigger event handler if available
    if (this.handlers.onContextUpdate) {
      this.handlers.onContextUpdate(key, value);
    }
  }

  /**
   * Add a context item
   */
  public addContextItem(item: ContextItem): void {
    // Check if item with this ID already exists
    const existingIndex = this.contextItems.findIndex(existing => existing.id === item.id);
    
    if (existingIndex >= 0) {
      // Update existing item
      this.contextItems[existingIndex] = {
        ...this.contextItems[existingIndex],
        ...item
      };
    } else {
      // Add new item
      this.contextItems.push(item);
    }
    
    // Trigger event handler if available
    if (this.handlers.onContextUpdate) {
      this.handlers.onContextUpdate(item.id, item);
    }
  }

  /**
   * Remove a context item
   */
  public removeContextItem(id: string): void {
    this.contextItems = this.contextItems.filter(item => item.id !== id);
  }

  /**
   * Update a context item property
   */
  public updateContextItem(id: string, updates: Partial<ContextItem>): void {
    const existingIndex = this.contextItems.findIndex(item => item.id === id);
    
    if (existingIndex >= 0) {
      this.contextItems[existingIndex] = {
        ...this.contextItems[existingIndex],
        ...updates
      };
      
      // Trigger event handler if available
      if (this.handlers.onContextUpdate) {
        this.handlers.onContextUpdate(id, this.contextItems[existingIndex]);
      }
    }
  }

  /**
   * Get a context value
   */
  public getValue(key: string, path?: string): any {
    // First check user inputs
    if (this.userInputs.hasOwnProperty(key)) {
      // Trigger event handler if available
      if (this.handlers.onContextRead) {
        this.handlers.onContextRead(key, path);
      }
      return this.userInputs[key];
    }
    
    // Then check context items
    const contextItem = this.contextItems.find(item => item.id === key);
    if (!contextItem) {
      console.warn(`Context item with key "${key}" not found`);
      return undefined;
    }
    
    // Trigger event handler if available
    if (this.handlers.onContextRead) {
      this.handlers.onContextRead(key, path);
    }
    
    // If no path, return the item content or the whole item
    if (!path) {
      return contextItem.content !== undefined ? contextItem.content : contextItem;
    }
    
    // Handle nested path
    const pathParts = path.split('.');
    let value = contextItem;
    
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        console.warn(`Property "${part}" not found in context item "${key}"`);
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Set a context value at a specific path
   */
  public setValue(key: string, value: any, path?: string): void {
    // Find or create the context item
    let contextItem = this.contextItems.find(item => item.id === key);
    
    if (!contextItem) {
      // Create new context item
      contextItem = { id: key, title: key, content: value };
      this.contextItems.push(contextItem);
      
      // Trigger event handler if available
      if (this.handlers.onContextUpdate) {
        this.handlers.onContextUpdate(key, contextItem);
      }
      return;
    }
    
    // If no path, update the content directly
    if (!path) {
      contextItem.content = value;
      
      // Trigger event handler if available
      if (this.handlers.onContextUpdate) {
        this.handlers.onContextUpdate(key, contextItem);
      }
      return;
    }
    
    // Handle nested path
    const pathParts = path.split('.');
    let target: any = contextItem;
    const lastPart = pathParts.pop();
    
    if (!lastPart) {
      console.warn('Invalid path provided');
      return;
    }
    
    for (const part of pathParts) {
      if (!(target[part] && typeof target[part] === 'object')) {
        target[part] = {};
      }
      target = target[part];
    }
    
    target[lastPart] = value;
    
    // Trigger event handler if available
    if (this.handlers.onContextUpdate) {
      this.handlers.onContextUpdate(key, contextItem, path);
    }
  }

  /**
   * Clear all user inputs
   */
  public clearUserInputs(): void {
    this.userInputs = {};
  }

  /**
   * Reset all context
   */
  public reset(newContext: ContextItem[] = []): void {
    this.contextItems = newContext;
    this.userInputs = {};
  }
}

export default FlowContextHandler;