// src/utils/validator.ts
/**
 * Validates a response object against a schema definition
 * @param data Object to validate
 * @param schema Schema definition or path to schema
 * @returns Object with validation result and errors
 */
export function validateResponseAgainstSchema(
    data: any,
    schema: any
  ): { isValid: boolean; errors: string[] } {
    // If no data or schema, return invalid
    if (!data || !schema) {
      return { 
        isValid: false, 
        errors: ["Missing data or schema"] 
      };
    }
  
    // Initialize result
    const errors: string[] = [];
  
    // Basic schema validation
    if (Array.isArray(schema)) {
      // If schema is a form field array, we need a different approach
      // Just check if data is not null or empty
      if (!data || Object.keys(data).length === 0) {
        errors.push("Response data is empty");
      }
    } else if (typeof schema === 'object') {
      // Check if required fields are present
      const missingFields = [];
      
      for (const key in schema) {
        if (schema[key].required && (data[key] === undefined || data[key] === null)) {
          missingFields.push(key);
        }
      }
      
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Check data types
      for (const key in data) {
        if (schema[key] && schema[key].type) {
          const expectedType = schema[key].type;
          const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key];
          
          if (
            (expectedType === 'string' && actualType !== 'string') ||
            (expectedType === 'number' && actualType !== 'number') ||
            (expectedType === 'boolean' && actualType !== 'boolean') ||
            (expectedType === 'array' && actualType !== 'array') ||
            (expectedType === 'object' && actualType !== 'object')
          ) {
            errors.push(`Invalid type for field '${key}': expected ${expectedType}, got ${actualType}`);
          }
        }
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Creates placeholder data based on a schema
   * @param schema Schema definition
   * @returns Object with placeholder data
   */
  export function createPlaceholderFromSchema(schema: any): any {
    if (!schema) return {};
  
    // If schema is a form field array
    if (Array.isArray(schema)) {
      const placeholder: Record<string, any> = {};
      
      schema.forEach(field => {
        if (field.name) {
          placeholder[field.name] = getDefaultValueForType(field.type);
        }
      });
      
      return placeholder;
    }
    
    // If schema is an object
    const placeholder: Record<string, any> = {};
    
    for (const key in schema) {
      const field = schema[key];
      
      if (field.type === 'object' && field.properties) {
        placeholder[key] = createPlaceholderFromSchema(field.properties);
      } else if (field.type === 'array' && field.items) {
        placeholder[key] = [
          createPlaceholderFromSchema(field.items)
        ];
      } else {
        placeholder[key] = getDefaultValueForType(field.type);
      }
    }
    
    return placeholder;
  }
  
  /**
   * Helper function to get default value for a data type
   */
  function getDefaultValueForType(type: string | undefined): any {
    switch (type) {
      case 'string':
        return "Sample text";
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return "Sample value";
    }
  }
  
  /**
   * Extracts schema from initialUserMessage if present
   * @param message The message to parse
   * @returns Extracted schema or null
   */
  export function extractSchemaFromMessage(message: string): any {
    if (!message) return null;
    
    // Look for JSON schema in the message
    const schemaMatch = message.match(/```json\s*([\s\S]*?)```/);
    
    if (schemaMatch && schemaMatch[1]) {
      try {
        return JSON.parse(schemaMatch[1]);
      } catch (e) {
        console.error("Failed to parse schema from message:", e);
        return null;
      }
    }
    
    return null;
  }