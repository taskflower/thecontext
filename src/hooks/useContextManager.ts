// src/hooks/useContextManager.ts
import { useState, useEffect } from 'react';
import { ContextManager } from '../../raw_modules/context-manager-module/src/core/ContextManager';
import { DefaultContextValidator } from '../../raw_modules/context-manager-module/src/core/ContextValidator';
import { ContextSchemaManager } from '../../raw_modules/context-manager-module/src/core/ContextSchemaManager';

// Create shared instances
const contextValidator = new DefaultContextValidator();
const schemaManager = new ContextSchemaManager(contextValidator);
const contextManager = new ContextManager();

export interface UseContextManagerProps {
  initialContext?: Record<string, any>;
  schemaIds?: string[];
}

/**
 * Hook for managing context using the ContextManager module
 */
export const useContextManager = ({ 
  initialContext, 
  schemaIds = [] 
}: UseContextManagerProps = {}) => {
  const [context, setContext] = useState<Record<string, any>>(
    initialContext || contextManager.getContext()
  );
  
  // Initialize context
  useEffect(() => {
    if (initialContext) {
      contextManager.setContext(initialContext);
      setContext(contextManager.getContext());
    }
  }, []);
  
  // Update context function
  const updateContext = (key: string, value: any, jsonPath?: string) => {
    try {
      const result = contextManager.updateContext(key, value, jsonPath);
      setContext(result);
      return result;
    } catch (error) {
      console.error('Error updating context:', error);
      return null;
    }
  };
  
  // Validate context against schema
  const validateContext = (schemaId: string) => {
    const schema = schemaManager.getSchema(schemaId);
    if (!schema) {
      console.error(`Schema with ID ${schemaId} not found`);
      return { valid: false, errors: [{ path: "", message: `Schema not found: ${schemaId}` }] };
    }
    
    return schemaManager.validateContext(context, schemaId);
  };
  
  return {
    context,
    updateContext,
    validateContext,
    processTemplate: (template: string) => contextManager.processTemplate(template),
    getValue: (key: string, jsonPath?: string) => contextManager.getValue(key, jsonPath)
  };
};

// Export singleton for direct access
export { contextManager };