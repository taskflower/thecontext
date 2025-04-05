/**
 * Context Service
 * Centralized service for managing context variables
 */

// Context value types
type ContextValuePrimitive = string | number | boolean | null;
type ContextValue = ContextValuePrimitive | ContextValueObject | ContextValueArray;
interface ContextValueObject {
  [key: string]: ContextValue;
}
type ContextValueArray = ContextValue[];

// Context item interface
interface ContextItem {
  id: string;
  key: string;
  value: ContextValue;
}

class ContextService {
  // In-memory storage for context values
  private contextStore: Record<string, ContextValue> = {};
  
  // Add a listener callback API for updates
  private listeners: Set<(key: string, value: ContextValue) => void> = new Set();
  
  /**
   * Get a context value by key
   */
  getValue(key: string, path?: string): ContextValue {
    const value = this.contextStore[key];
    
    // If path is provided, navigate to the nested value
    if (path && value !== undefined && typeof value === 'object' && value !== null) {
      return this.getNestedValue(value, path);
    }
    
    return value;
  }
  
  /**
   * Set a context value
   */
  setValue(key: string, value: ContextValue, path?: string): void {
    if (path && typeof value !== 'object') {
      // Update a nested value
      const currentValue = this.contextStore[key];
      
      if (typeof currentValue === 'object' && currentValue !== null) {
        const updatedValue = this.setNestedValue(currentValue, path, value);
        this.contextStore[key] = updatedValue;
      } else {
        // If the current value is not an object, create a new object with the path
        const newObject = this.createNestedObject({}, path, value);
        this.contextStore[key] = newObject;
      }
    } else {
      // Update the entire value
      this.contextStore[key] = value;
    }
    
    // Notify listeners
    this.notifyListeners(key, this.contextStore[key]);
  }
  
  /**
   * Process a template string with context variables
   */
  processTemplate(template: string): string {
    if (!template) return '';
    
    try {
      let result = template;
      const tokenRegex = /{{([^{}]+)}}/g;
      let match;
      
      while ((match = tokenRegex.exec(template)) !== null) {
        const fullToken = match[0];
        const tokenContent = match[1].trim();
        
        // Split token into key and path (if it has a path)
        const [key, path] = tokenContent.includes('.')
          ? [tokenContent.split('.')[0], tokenContent.split('.').slice(1).join('.')]
          : [tokenContent, undefined];
        
        // Get the value
        let value = this.getValue(key, path);
        
        // Convert to string (with special handling for objects and arrays)
        const stringValue = typeof value === 'object'
          ? JSON.stringify(value)
          : String(value || '');
        
        // Replace in the template
        result = result.replace(fullToken, stringValue);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing template:', error);
      return template;
    }
  }
  
  /**
   * Subscribe to context changes
   */
  subscribe(callback: (key: string, value: ContextValue) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * Clear all context values
   */
  clearAll(): void {
    this.contextStore = {};
  }
  
  /**
   * Get all context items
   */
  getAllItems(): ContextItem[] {
    return Object.entries(this.contextStore).map(([key, value]) => ({
      id: key,
      key,
      value
    }));
  }
  
  // Private helper methods
  
  /**
   * Get a nested value from an object using a dot-separated path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Set a nested value in an object using a dot-separated path
   */
  private setNestedValue(obj: any, path: string, value: any): any {
    // Create a copy of the object to avoid mutations
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    const parts = path.split('.');
    
    let current = result;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Create the path if it doesn't exist
      if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Set the value at the last part
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
    
    return result;
  }
  
  /**
   * Create a nested object from a path and value
   */
  private createNestedObject(obj: any, path: string, value: any): any {
    const parts = path.split('.');
    const lastPart = parts.pop()!;
    
    let current = obj;
    
    // Create nested objects for each part of the path
    for (const part of parts) {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value at the last part
    current[lastPart] = value;
    
    return obj;
  }
  
  /**
   * Notify all listeners of a context change
   */
  private notifyListeners(key: string, value: ContextValue): void {
    this.listeners.forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        console.error('Error in context listener:', error);
      }
    });
  }
}

// Create and export singleton instance
export default new ContextService();