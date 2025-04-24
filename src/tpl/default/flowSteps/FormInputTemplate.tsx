// src/templates/default/flowSteps/FormInputTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

const FormInputTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<any[]>([]);
  
  const processTemplate = useContextStore((state) => state.processTemplate);
  const updateByContextPath = useContextStore((state) => state.updateByContextPath);
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);

  const contextSchemas = useContextStore(
    (state) => state.contexts[currWrkspId || ""]?.schemas?.form
  );

  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

 

  // Load form fields based on schema path
  useEffect(() => {
    if (!contextSchemas || !node.attrs?.schemaPath) {
      console.warn("No schema or schema path found");
      setFormFields([]);
      return;
    }

    const schemaKey = node.attrs.schemaPath.replace(/^schemas\.form\./, "");
    const fields = contextSchemas[schemaKey];

    if (Array.isArray(fields)) {
      setFormFields(fields);
    } else {
      console.warn("No fields found for schema:", schemaKey);
      setFormFields([]);
    }
  }, [contextSchemas, node.attrs?.schemaPath]);

  // Handle input changes
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const isValid = formFields.every(
      (field) => !field.required || (formData[field.name] !== undefined && formData[field.name] !== "")
    );

    if (!isValid) {
      alert("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    // Update context if path is provided
    if (node.contextPath) {
      Object.entries(formData).forEach(([key, value]) => {
        updateByContextPath(`${node.contextPath}.${key}`, value);
      });
    }

    // Submit data
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Assistant message */}
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Debugging info if no fields */}
      {formFields.length === 0 && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">Nie znaleziono pól formularza. Sprawdź konfigurację.</p>
          <pre className="mt-2 text-xs">
            Schema path: {node.attrs?.schemaPath}
            Workspace ID: {currWrkspId}
            Available schemas: {JSON.stringify(Object.keys(contextSchemas || {}))}
          </pre>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => (
          <div key={field.name} className="space-y-2 p-4 bg-white">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'select' && field.options ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Wybierz...</option>
                {field.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
                required={field.required}
                className="p-4 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder={`Wprowadź ${field.label.toLowerCase()}`}
              />
            ) : (
              <input
                type="text"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="p-4 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder={`Wprowadź ${field.label.toLowerCase()}`}
              />
            )}
            
            {field.description && (
              <p className="mt-1 text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <button 
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Wstecz
          </button>
          
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isLastNode ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormInputTemplate;