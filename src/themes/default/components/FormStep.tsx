// src/themes/default/components/EnhancedFormStep.tsx
import React, { useEffect } from 'react';
import { TemplateComponentProps } from '../../../core/types';
import { useFormSchema } from '../../../core/hooks/useFormSchema';

// Rozszerzony interfejs props
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
  // Korzystamy z rozszerzonego hooka useFormSchema
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
  
  // Logi do debugowania - tylko raz przy montażu komponentu
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

  // Renderowanie pojedynczego pola
  const renderField = (fieldName: string) => {
    const fieldSchema = fieldSchemas[fieldName];
    if (!fieldSchema) return null;
    
    const { fieldType, title, required, description, options } = fieldSchema;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];
    const hasError = !!fieldError;
    
    return (
      <div key={fieldName} className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {title} {required && <span className="text-red-500">*</span>}
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
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        
        {fieldType === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className={`mr-2 ${hasError ? 'border-red-500' : ''}`}
            />
            <span className="text-sm text-gray-700">{fieldSchema.placeholder || 'Zaznacz'}</span>
          </div>
        )}
        
        {fieldType === 'email' && (
          <input
            type="email"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || 'email@example.com'}
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        
        {fieldType === 'date' && (
          <input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        
        {fieldType === 'textarea' && (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder}
            rows={4}
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        
        {fieldType === 'select' && options && (
          <select
            value={fieldValue || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
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
          <p className="text-red-500 text-sm mt-1">{fieldError}</p>
        )}
      </div>
    );
  };

  // Renderowanie formularza
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Wyświetl pola na podstawie schematów */}
        {Object.keys(fieldSchemas).map(renderField)}
        
        {/* Brak pól w schemacie */}
        {Object.keys(fieldSchemas).length === 0 && (
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
            <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
          </div>
        )}
        
        {/* Informacja o wymaganych polach */}
        {showRequiredHint && hasRequiredFields && (
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        )}
        
        {/* Ogólny błąd formularza */}
        {errors._form && (
          <div className="my-4 p-3 bg-red-100 text-red-700 rounded">
            <p>{errors._form}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;