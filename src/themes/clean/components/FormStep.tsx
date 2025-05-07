// src/themes/clean/components/FormStep.tsx
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
      <div key={fieldName} className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {title} {required && <span className="text-red-600">*</span>}
        </label>
        
        {description && (
          <p className="text-xs text-gray-500 mb-1">{description}</p>
        )}
        
        {fieldType === 'text' && (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          />
        )}
        
        {fieldType === 'number' && (
          <input
            type="number"
            value={fieldValue === undefined ? '' : fieldValue}
            min={fieldSchema.min}
            max={fieldSchema.max}
            step={fieldSchema.step}
            onChange={(e) => handleChange(fieldName, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={fieldSchema.placeholder}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          />
        )}
        
        {fieldType === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className={`h-4 w-4 text-slate-800 focus:ring-slate-300 ${hasError ? '' : ''} rounded`}
            />
            <span className="ml-2 text-sm text-gray-600">{fieldSchema.placeholder || 'Zaznacz'}</span>
          </div>
        )}
        
        {fieldType === 'email' && (
          <input
            type="email"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || 'email@example.com'}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          />
        )}
        
        {fieldType === 'date' && (
          <input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          />
        )}
        
        {fieldType === 'textarea' && (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder}
            rows={4}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          />
        )}
        
        {fieldType === 'select' && options && (
          <select
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`w-full p-2 rounded-md shadow-sm focus:ring-2 focus:ring-slate-300 ${hasError ? 'focus:ring-red-200' : ''}`}
          >
            <option value="">-- Wybierz --</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {hasError && (
          <p className="text-red-600 text-sm mt-1">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-3">{title}</h2>
      
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).map(renderField)}
        
        {Object.keys(fieldSchemas).length === 0 && (
          <div className="p-4 text-amber-800">
            <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
          </div>
        )}
        
        {showRequiredHint && hasRequiredFields && (
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-600">*</span> są wymagane
          </p>
        )}
        
        {errors._form && (
          <div className="my-4 p-4 text-red-700">
            <p>{errors._form}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;