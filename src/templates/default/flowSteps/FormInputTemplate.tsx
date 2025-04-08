// src/templates/flowSteps/FormInputTemplate.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';

// Definicja interfejsu dla pola formularza
interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

const FormInputTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  
  // Parse form fields from node config
  const formFields = (node.formFields || [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true }
  ]) as FormField[];

  const handleChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Convert form values to JSON string
    onSubmit(JSON.stringify(formValues));
    setFormValues({});
  };

  const isFormValid = () => {
    return formFields
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
          {formFields.map((field: FormField) => (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
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