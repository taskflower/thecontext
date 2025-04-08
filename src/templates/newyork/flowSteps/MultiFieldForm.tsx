// src/templates/newyork/flowSteps/MultiFieldForm.tsx
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';

// Definicja interfejsu dla pola formularza
interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const MultiFieldForm: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  // Parse form fields from node config or use defaults
  const formFields = (node.formFields || [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
    { name: 'rating', label: 'Rating', type: 'select', required: true, options: [
      { value: '', label: 'Select a rating' },
      { value: '1', label: '1 - Poor' },
      { value: '2', label: '2 - Below Average' },
      { value: '3', label: '3 - Average' },
      { value: '4', label: '4 - Good' },
      { value: '5', label: '5 - Excellent' }
    ]},
    { name: 'feedback', label: 'Additional Feedback', type: 'textarea', required: false, placeholder: 'Share your thoughts...' }
  ]) as FormField[];

  const handleChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allTouched = formFields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouchedFields(allTouched);
    
    // Check if form is valid
    if (isFormValid()) {
      // Convert form values to JSON string
      onSubmit(JSON.stringify(formValues));
      setFormValues({});
      setTouchedFields({});
    }
  };

  const getFieldError = (field: FormField): string => {
    if (!touchedFields[field.name]) return '';
    
    if (field.required && (!formValues[field.name] || formValues[field.name].trim() === '')) {
      return `${field.label} is required`;
    }
    
    if (field.type === 'email' && formValues[field.name]?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues[field.name])) {
        return 'Please enter a valid email address';
      }
    }
    
    return '';
  };

  const isFormValid = () => {
    return formFields.every(field => !getFieldError(field));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 flex items-center space-x-1">
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
        <div className="h-1 w-6 bg-gray-200 rounded"></div>
        <div className="h-1 w-12 bg-black rounded"></div>
      </div>
      
      {/* Form header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {node.title || 'Please complete the form'}
        </h2>
        {node.assistantMessage && (
          <p className="mt-2 text-gray-600">
            {node.assistantMessage}
          </p>
        )}
      </div>
      
      {/* Form fields */}
      <div className="space-y-6 mb-8">
        {formFields.map((field: FormField) => {
          const error = getFieldError(field);
          
          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              )}
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastNode ? 'Submit' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default MultiFieldForm;