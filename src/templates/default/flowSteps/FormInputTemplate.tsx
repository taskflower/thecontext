// src/templates/flowSteps/FormInputTemplate.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';

// Rozszerzony interfejs FlowStepProps, który uwzględnia kontekst


// Definicja interfejsu dla pola formularza
interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[]; // Dla pól typu select
}

const FormInputTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formSchema, setFormSchema] = useState<FormField[]>([]);
  
  // Pobierz schemat formularza z węzła lub z kontekstu
  useEffect(() => {
    // Najpierw sprawdź, czy schemat jest bezpośrednio w węźle
    if (node.formFields && Array.isArray(node.formFields)) {
      setFormSchema(node.formFields as FormField[]);
      return;
    }
    
    // Jeśli nie, spróbuj pobrać schemat z kontekstu
    if (node.formSchemaContextKey && typeof contextItems === 'object' && contextItems !== null) {
      const schemaItem = contextItems.find(item => 
        item.id === node.formSchemaContextKey || item.title === node.formSchemaContextKey
      );
      
      if (schemaItem) {
        try {
          const parsedSchema = JSON.parse(schemaItem.content);
          if (Array.isArray(parsedSchema)) {
            setFormSchema(parsedSchema);
            return;
          }
        } catch (error) {
          console.error('Error parsing form schema from context:', error);
        }
      }
    }
    
    // Jeśli nic nie zostało znalezione, użyj domyślnego schematu
    setFormSchema([
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'preferences.theme', label: 'Preferred Theme', type: 'select', required: true, 
        options: ["light", "dark", "system"] }
    ]);
  }, [node, contextItems]);

  const handleChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Process the form values to handle nested paths
    const processedValues = processFormValuesForContext(formValues);
    
    // Submit the processed values
    onSubmit(JSON.stringify(processedValues));
    setFormValues({});
  };

  // Function to process form values and handle nested paths (e.g., preferences.theme)
  const processFormValuesForContext = (values: Record<string, string>) => {
    const result: Record<string, any> = {};
    
    Object.entries(values).forEach(([key, value]) => {
      if (key.includes('.')) {
        // Handle nested path (e.g., preferences.theme)
        const parts = key.split('.');
        let current = result;
        
        // Create nested object structure
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value at the deepest level
        current[parts[parts.length - 1]] = value;
      } else {
        // Simple key-value pair
        result[key] = value;
      }
    });
    
    return result;
  };

  const isFormValid = () => {
    return formSchema
      .filter((field: FormField) => field.required)
      .every((field: FormField) => formValues[field.name] && formValues[field.name].trim() !== '');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{node.title || 'Form Input'}</h2>
        <p className="text-gray-700 mb-4">
          {node.assistantMessage || 'Please fill out the form below:'}
        </p>
        
        <div className="space-y-4">
          {formSchema.map((field: FormField) => (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'select' && field.options ? (
                <select
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="">Select an option</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full p-2 border rounded-md"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Opcjonalnie: Wyświetlanie kontekstu dla debugowania */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs rounded">
          <p>Debug - Context Items:</p>
          {Array.isArray(contextItems) ? (
            <pre>{JSON.stringify(contextItems.map(item => ({ id: item.id, content: item.content?.substring(0, 50) })), null, 2)}</pre>
          ) : (
            <pre>{JSON.stringify(contextItems, null, 2)}</pre>
          )}
          <p>Form Schema:</p>
          <pre>{JSON.stringify(formSchema, null, 2)}</pre>
          <p>Form Values:</p>
          <pre>{JSON.stringify(formValues, null, 2)}</pre>
          <p>Processed Form Values:</p>
          <pre>{JSON.stringify(processFormValuesForContext(formValues), null, 2)}</pre>
        </div>
      )}

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLastNode ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default FormInputTemplate;