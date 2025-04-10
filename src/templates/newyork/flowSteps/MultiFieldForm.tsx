// src/templates/newyork/flowSteps/MultiFieldForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FormField, FlowStepProps } from "@/views/types";
import { useAppStore } from "@/lib/store";

interface FormInputAttrs {
  formSchemaPath?: string;
  [key: string]: any;
}

const MultiFieldForm: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  // State for form data and fields
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  
  // Extract attrs from node (with typing)
  const attrs = node.attrs as FormInputAttrs;

  // Get context functions from AppStore
  const processTemplate = useAppStore((state) => state.processTemplate);
  const updateContext = useAppStore((state) => state.updateContext);
  const getContextPath = useAppStore((state) => state.getContextPath);
  const getContext = useAppStore((state) => state.getContext);
  const updateByContextPath = useAppStore((state) => state.updateByContextPath);

  // Load form schema
  useEffect(() => {
    if (attrs?.formSchemaPath) {
      const schema = getContextPath(attrs.formSchemaPath);
      if (schema && Array.isArray(schema)) {
        setFormFields(schema);
        console.log("Załadowano schemat formularza:", schema);
      }
    }
  }, [attrs, getContextPath]);

  // Process assistant message with context variables
  const assistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Function to check if all required fields are filled
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

    // New logic handling contextPath
    if (node.contextPath && formFields.length > 0) {
      // Get main context key from contextPath
      const contextKey = node.contextPath.split('.')[0];
      
      // Get current context
      let contextData = getContext();
      const profileData = contextData[contextKey] || {};
      
      // Create a copy to avoid modifying the original object
      const updatedProfile = {...profileData};
      
      console.log("Aktualny kontekst przed aktualizacją:", updatedProfile);
      console.log("Dane formularza:", formData);
      
      // Update data from the form
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
      
      console.log("Zaktualizowany kontekst:", updatedProfile);
      
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
      
      console.log("Aktualny kontekst przed aktualizacją:", updatedUserProfile);
      console.log("Dane formularza:", formData);
      
      // Update data from the form
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
      
      console.log("Zaktualizowany kontekst:", updatedUserProfile);
      
      // Update the entire object in context
      updateContext(node.contextKey, updatedUserProfile);
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 flex items-center space-x-1">
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
        <div className="h-1 w-12 bg-black rounded"></div>
      </div>
      
      {/* Wiadomość asystenta */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="whitespace-pre-line">{assistantMessage}</p>
      </div>
      
      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {formFields.map((field) => {
         if (field.type === 'select' && field.options) {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-colors border-gray-300"
                  required={field.required}
                >
                  <option value="">Wybierz...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          } else {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-colors border-gray-300"
                  required={field.required}
                />
              </div>
            );
          }
        })}
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={!areRequiredFieldsFilled()}
            className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastNode ? 'Submit' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiFieldForm;