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
    
    const inputClasses = `w-full px-3 py-2 border rounded-lg shadow-sm 
      focus:outline-none focus:ring-2 ${hasError 
        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-200' 
        : 'border-sky-200 focus:border-indigo-300 focus:ring-indigo-100'}`;
    
    return (
      <div key={fieldName} className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {title} {required && <span className="text-rose-500">*</span>}
        </label>
        
        {description && (
          <p className="text-xs text-slate-500 mb-1">{description}</p>
        )}
        
        {fieldType === 'text' && (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder}
            className={inputClasses}
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
            className={inputClasses}
          />
        )}
        
        {fieldType === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className={`h-4 w-4 text-indigo-600 focus:ring-indigo-300 ${hasError ? 'border-rose-300' : 'border-sky-300'} rounded`}
            />
            <span className="ml-2 text-sm text-slate-600">{fieldSchema.placeholder || 'Zaznacz'}</span>
          </div>
        )}
        
        {fieldType === 'email' && (
          <input
            type="email"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || 'email@example.com'}
            className={inputClasses}
          />
        )}
        
        {fieldType === 'date' && (
          <input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={inputClasses}
          />
        )}
        
        {fieldType === 'textarea' && (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder}
            rows={4}
            className={inputClasses}
          />
        )}
        
        {fieldType === 'select' && options && (
          <select
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={inputClasses}
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
          <p className="text-rose-500 text-sm mt-1">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-3">{title}</h2>
      
      {description && (
        <p className="text-slate-500 mb-6">{description}</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {Object.keys(fieldSchemas).map(renderField)}
        
        {Object.keys(fieldSchemas).length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
            <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
          </div>
        )}
        
        {showRequiredHint && hasRequiredFields && (
          <p className="text-xs text-slate-500 mt-2 mb-4">
            Pola oznaczone <span className="text-rose-500">*</span> są wymagane
          </p>
        )}
        
        {errors._form && (
          <div className="my-4 p-4 bg-rose-50 border border-rose-200 rounded-md text-rose-600">
            <p>{errors._form}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;
