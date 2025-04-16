import { useState, useCallback, useEffect } from "react";
import { FormField } from "@/views/types";
import { useAppStore } from "@/lib/store";

interface FormInputAttrs {
  formSchemaPath?: string;
  schemaPath?: string;  // New path format
  [key: string]: any;
}

interface UseFormInputProps {
  node: {
    attrs?: FormInputAttrs;
    assistantMessage?: string;
    contextPath?: string;
    contextKey?: string;
  };
}

interface UseFormInputReturn {
  formData: Record<string, any>;
  formFields: FormField[];
  processedAssistantMessage: string;
  handleChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  areRequiredFieldsFilled: () => boolean;
}

export const useFormInput = ({ node }: UseFormInputProps): UseFormInputReturn => {
  // State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  
  // Get attrs from node with typing
  const attrs = node.attrs as FormInputAttrs;

  // Get context functions from AppStore
  const processTemplate = useAppStore((state) => state.processTemplate);
  const updateContext = useAppStore((state) => state.updateContext);
  const getContextPath = useAppStore((state) => state.getContextPath);
  const getContext = useAppStore((state) => state.getContext);

  // Process assistant message with context variables
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Load form schema
  useEffect(() => {
    // First try new schema path format if provided
    if (attrs?.schemaPath) {
      let schemaPath = attrs.schemaPath;
      
      // Ensure schemas prefix is present
      if (!schemaPath.startsWith('schemas.form.')) {
        schemaPath = schemaPath.startsWith('schemas.') 
          ? schemaPath 
          : `schemas.form.${schemaPath}`;
      }
      
      const schema = getContextPath(schemaPath);
      if (schema && Array.isArray(schema)) {
        setFormFields(schema);
        console.log("Loaded form schema using new path:", schemaPath);
        return;
      } else {
        console.warn(`Form schema not found using new path: ${schemaPath}`);
      }
    }
    
    // Fall back to old formSchemaPath if no schemaPath or it failed
    if (attrs?.formSchemaPath) {
      // Spróbuj najpierw bezpośrednio z ścieżką
      const schema = getContextPath(attrs.formSchemaPath);
      if (schema && Array.isArray(schema)) {
        setFormFields(schema);
        console.log("Loaded form schema using legacy path:", attrs.formSchemaPath);
        return;
      }
      
      // Spróbuj dodać prefix schemas.form jeśli nie ma go jeszcze
      if (!attrs.formSchemaPath.startsWith('schemas.')) {
        const schemasFormPath = `schemas.form.${attrs.formSchemaPath}`;
        const schemaWithPrefix = getContextPath(schemasFormPath);
        
        if (schemaWithPrefix && Array.isArray(schemaWithPrefix)) {
          setFormFields(schemaWithPrefix);
          console.log("Loaded form schema with schemas.form prefix:", schemasFormPath);
          return;
        }
      }
      
      // Spróbuj z prefiksem formSchemas jako ostatnią opcję
      if (!attrs.formSchemaPath.startsWith('formSchemas.')) {
        const fullPath = `formSchemas.${attrs.formSchemaPath}`;
        const altSchema = getContextPath(fullPath);
        
        if (altSchema && Array.isArray(altSchema)) {
          setFormFields(altSchema);
          console.log("Loaded form schema from formSchemas namespace:", fullPath);
          return;
        }
      }
      
      console.error("Failed to load form schema from any path", {
        providedPath: attrs.formSchemaPath,
        schemasFormPath: `schemas.form.${attrs.formSchemaPath}`,
        formSchemasPath: `formSchemas.${attrs.formSchemaPath}`
      });
    }
    
    // Jeśli nic nie znaleziono, spróbuj użyć ścieżki kontekstowej
    if (node.contextPath) {
      const contextKey = node.contextPath.split('.')[0];
      const possibleSchemaPath = `schemas.form.${contextKey}`;
      const schemaByContext = getContextPath(possibleSchemaPath);
      
      if (schemaByContext && Array.isArray(schemaByContext)) {
        setFormFields(schemaByContext);
        console.log("Loaded form schema based on context path:", possibleSchemaPath);
        return;
      }
      
      // Sprawdź też starszy format
      const legacySchemaPath = `formSchemas.${contextKey}`;
      const legacySchemaByContext = getContextPath(legacySchemaPath);
      
      if (legacySchemaByContext && Array.isArray(legacySchemaByContext)) {
        setFormFields(legacySchemaByContext);
        console.log("Loaded form schema based on context path (legacy format):", legacySchemaPath);
        return;
      }
    }
    
    console.warn("Could not find any valid form schema");
  }, [attrs, getContextPath, node.contextPath]);

  // Check if all required fields are filled
  const areRequiredFieldsFilled = useCallback(() => {
    if (!formFields.length) return true;
    
    return formFields.every(field => {
      if (field.required) {
        const value = formData[field.name];
        return value !== undefined && value !== "" && value !== null;
      }
      return true;
    });
  }, [formFields, formData]);

  // Handle form field changes
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // New logic for handling contextPath
    if (node.contextPath && formFields.length > 0) {
      // Get main context key from contextPath
      const contextKey = node.contextPath.split('.')[0];
      
      // Get current context
      let contextData = getContext();
      const profileData = contextData[contextKey] || {};
      
      // Create a copy to avoid modifying the original object
      const updatedProfile = {...profileData};
      
      console.log("Current context before update:", updatedProfile);
      console.log("Form data:", formData);
      
      // Update data from form
      formFields.forEach(field => {
        const value = formData[field.name];
        if (value !== undefined) {
          if (field.name.includes('.')) {
            // Handle nested fields
            const parts = field.name.split('.');
            let current = updatedProfile;
            
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i];
              // Initialize object if it doesn't exist
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part];
            }
            current[parts[parts.length - 1]] = value;
          } else {
            // Non-nested fields
            updatedProfile[field.name] = value;
          }
        }
      });
      
      console.log("Updated context:", updatedProfile);
      
      // Update the entire object in context
      updateContext(contextKey, updatedProfile);
    }
    // Handle older method with contextKey
    else if (node.contextKey && formFields.length > 0) {
      // Get current context
      let contextData = getContext();
      const userProfileData = contextData[node.contextKey] || {};
      
      // Create a copy to avoid modifying the original object
      const updatedUserProfile = {...userProfileData};
      
      console.log("Current context before update:", updatedUserProfile);
      console.log("Form data:", formData);
      
      // Update data from form
      formFields.forEach(field => {
        const value = formData[field.name];
        if (value !== undefined) {
          if (field.name.includes('.')) {
            // Handle nested fields
            const parts = field.name.split('.');
            let current = updatedUserProfile;
            
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i];
              // Initialize object if it doesn't exist
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part];
            }
            current[parts[parts.length - 1]] = value;
          } else {
            // Non-nested fields
            updatedUserProfile[field.name] = value;
          }
        }
      });
      
      console.log("Updated context:", updatedUserProfile);
      
      // Update the entire object in context
      updateContext(node.contextKey, updatedUserProfile);
    }

    return formData;
  };

  return {
    formData,
    formFields,
    processedAssistantMessage,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
  };
};