/**
 * Context processing service
 * Handles template variables and context substitution
 */

export interface ContextItem {
  id: string;
  title: string;
  contentType?: string;
  content?: string;
  [key: string]: any;
}

export interface ProcessOptions {
  strict?: boolean;  // If true, throw error on missing variable
  debug?: boolean;   // If true, log debugging info
}

/**
 * Process template string with context variables
 * 
 * Supports variable format: {{variable}} or {{variable.path.to.property}}
 */
export const processTemplate = (
  text: string,
  contextItems: ContextItem[] = [],
  userInputs: Record<string, string> = {},
  options: ProcessOptions = {}
): string => {
  if (!text) return "";
  
  try {
    const { strict = false, debug = false } = options;
    
    // Regular expression to match variables in the format {{name}} or {{name.path.to.property}}
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
      if (debug) console.log(`Processing variable: ${varPath}`);
      
      // Split path by dots to handle nested properties
      const [varName, ...propertyPath] = varPath.trim().split('.');
      
      // First check user inputs
      if (userInputs.hasOwnProperty(varName)) {
        let value = userInputs[varName];
        if (debug) console.log(`Found in userInputs: ${value}`);
        return value || '';
      }
      
      // Then check context items
      const contextItem = contextItems.find(item => item.id === varName);
      if (contextItem) {
        // If no property path, return the content
        if (propertyPath.length === 0) {
          if (debug) console.log(`Found in contextItems: ${contextItem.content}`);
          return contextItem.content || '';
        }
        
        // Handle nested properties
        let value = contextItem;
        for (const prop of propertyPath) {
          if (value && typeof value === 'object' && prop in value) {
            value = value[prop];
          } else {
            if (strict) throw new Error(`Property ${prop} not found in context item ${varName}`);
            return match; // Return original match if property not found
          }
        }
        
        if (debug) console.log(`Found nested property: ${value}`);
        return value !== undefined && value !== null ? String(value) : '';
      }
      
      // If variable not found
      if (strict) throw new Error(`Context variable ${varName} not found`);
      return match; // Return original match if variable not found
    });
  } catch (error) {
    console.error("Error processing template:", error);
    if (options.strict) {
      throw error;
    }
    return text;
  }
};

/**
 * Get a value from context items
 */
export const getContextValue = (
  key: string,
  path: string | null = null,
  contextItems: ContextItem[] = [],
  userInputs: Record<string, string> = {}
): any => {
  try {
    // First check user inputs
    if (userInputs.hasOwnProperty(key)) {
      return userInputs[key];
    }
    
    // Then check context items
    const contextItem = contextItems.find(item => item.id === key);
    if (!contextItem) {
      console.warn(`Context item with key "${key}" not found`);
      return undefined;
    }
    
    // If no path, return the item or its content
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
  } catch (error) {
    console.error("Error getting context value:", error);
    return undefined;
  }
};

export default {
  processTemplate,
  getContextValue
};