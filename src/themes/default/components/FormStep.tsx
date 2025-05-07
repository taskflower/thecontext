// src/themes/default/components/FormStep.tsx
import React, { useEffect } from 'react';
import { TemplateComponentProps } from '../../../core/types';
import { useFormSchema } from '../../../core/hooks/useFormSchema';

interface EnhancedFormStepProps extends TemplateComponentProps {
  jsonSchema?: any;
  title?: string;
  description?: string;
  submitLabel?: string;
  showRequiredHint?: boolean;
}

const FormStep: React.FC<EnhancedFormStepProps> = ({ 
  schema,
  jsonSchema,
  data,
  onSubmit,
  title = 'Formularz',
  description,
  submitLabel = 'Dalej',
  showRequiredHint = true,
  ...props
}) => {
  const { 
    formData, 
    errors, 
    handleChange, 
    validateForm,
    fieldSchemas,
    hasRequiredFields
  } = useFormSchema({
    schema,
    jsonSchema,
    initialData: data
  });
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("EnhancedFormStep - fieldSchemas:", fieldSchemas);
    }
  }, [fieldSchemas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (fieldName: string) => {
    const fieldSchema = fieldSchemas[fieldName];
    if (!fieldSchema) return null;
    
    const { fieldType, title, required, description, options } = fieldSchema;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];
    const hasError = !!fieldError;
    
    return (
      <div key={fieldName} className="my-4 space-y-3">
        <label className="text-base font-medium text-gray-900">
          {title} {required && <span className="text-red-600">*</span>}
        </label>
        
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
        
        {fieldType === 'text' && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <input
              type="text"
              value={fieldValue || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.placeholder}
              className="flex h-12 w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
            />
          </div>
        )}
        
        {fieldType === 'number' && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <input
              type="number"
              value={fieldValue === undefined ? '' : fieldValue}
              min={fieldSchema.min}
              max={fieldSchema.max}
              step={fieldSchema.step}
              onChange={(e) => handleChange(fieldName, e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={fieldSchema.placeholder}
              className="flex h-12 w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
            />
          </div>
        )}
        
        {fieldType === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-base text-gray-900">{fieldSchema.placeholder || 'Zaznacz'}</span>
          </div>
        )}
        
        {fieldType === 'email' && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-12 px-3 text-base rounded-md bg-gray-100 text-gray-500">
                @
              </div>
              <input
                type="email"
                value={fieldValue || ''}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={fieldSchema.placeholder || 'email@example.com'}
                className="flex h-12 w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
              />
            </div>
          </div>
        )}
        
        {fieldType === 'date' && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <input
              type="date"
              value={fieldValue || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="flex h-12 w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
            />
          </div>
        )}
        
        {fieldType === 'textarea' && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.placeholder}
              rows={4}
              className="w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
            />
          </div>
        )}
        
        {fieldType === 'select' && options && (
          <div className="relative w-full border-2 rounded-md transition-all border-gray-200 hover:border-gray-400">
            <select
              value={fieldValue || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="flex h-12 w-full bg-transparent px-3 py-2 text-base focus-visible:outline-none"
            >
              <option value="">-- Wybierz --</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {hasError && (
          <p className="text-red-600 text-sm">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).map(renderField)}
        
        {Object.keys(fieldSchemas).length === 0 && (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
            <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
          </div>
        )}
        
        {showRequiredHint && hasRequiredFields && (
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-600">*</span> są wymagane
          </p>
        )}
        
        {errors._form && (
          <div className="my-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p>{errors._form}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-5 py-3 rounded-md transition-colors text-base font-medium w-full bg-gray-900 text-white hover:bg-gray-800"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;