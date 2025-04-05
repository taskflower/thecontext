/**
 * Hook for template management
 */
import { useState, useEffect, useMemo } from 'react';
import type { TemplateConfig } from '../../templates/types';
import templates, { getTemplateById } from '../../templates';

export interface UseTemplateSystemOptions {
  initialTemplateId?: string;
  onTemplateChange?: (templateId: string) => void;
}

export interface UseTemplateSystemResult {
  currentTemplateId: string;
  setCurrentTemplateId: (id: string) => void;
  currentTemplate: TemplateConfig;
  availableTemplates: TemplateConfig[];
  getComponent: <T>(componentName: string) => React.ComponentType<T>;
}

/**
 * Hook for managing application templates
 */
export const useTemplateSystem = (options: UseTemplateSystemOptions = {}): UseTemplateSystemResult => {
  const { initialTemplateId = 'default', onTemplateChange } = options;
  
  // Local state for current template ID
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(initialTemplateId);
  
  // Get available templates
  const availableTemplates = useMemo(() => Object.values(templates), []);
  
  // Get current template
  const currentTemplate = useMemo(() => {
    const template = getTemplateById(currentTemplateId);
    return template || getTemplateById('default') || availableTemplates[0];
  }, [currentTemplateId, availableTemplates]);
  
  // Function to set current template with validation
  const setTemplateId = (id: string) => {
    if (getTemplateById(id)) {
      setCurrentTemplateId(id);
    } else {
      console.warn(`Template with id "${id}" not found. Using default.`);
      setCurrentTemplateId('default');
    }
  };
  
  // Call onTemplateChange when template changes
  useEffect(() => {
    if (onTemplateChange) {
      onTemplateChange(currentTemplateId);
    }
  }, [currentTemplateId, onTemplateChange]);
  
  // Function to get a component by name
  const getComponent = <T>(componentName: string): React.ComponentType<T> => {
    if (
      currentTemplate?.components && 
      componentName in currentTemplate.components
    ) {
      return currentTemplate.components[componentName] as React.ComponentType<T>;
    }
    
    // Fallback to default template if component not found
    const defaultTemplate = getTemplateById('default');
    if (
      defaultTemplate?.components && 
      componentName in defaultTemplate.components
    ) {
      console.warn(
        `Component "${componentName}" not found in template "${currentTemplateId}". Using default.`
      );
      return defaultTemplate.components[componentName] as React.ComponentType<T>;
    }
    
    // Return empty component as last resort
    console.error(`Component "${componentName}" not found in any template.`);
    return (() => null) as unknown as React.ComponentType<T>;
  };
  
  return {
    currentTemplateId,
    setCurrentTemplateId: setTemplateId,
    currentTemplate,
    availableTemplates,
    getComponent,
  };
};

export default useTemplateSystem;