import React, { useState, useEffect } from 'react';
import { TemplateComponentProps } from '../../../core/types';

// Rozszerzony interfejs props
interface FormStepProps extends TemplateComponentProps {
  jsonSchema?: any;
}

const FormStep: React.FC<FormStepProps> = ({ 
  schema,
  jsonSchema,
  data,
  onSubmit,
  ...props
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(data || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Logi do debugowania - tylko raz przy montażu komponentu
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("FormStep - schema:", schema);
      console.log("FormStep - jsonSchema:", jsonSchema);
      console.log("FormStep - data:", data);
    }
  }, []); // Pusta tablica zależności - uruchomienie tylko raz

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prosta walidacja - sprawdź wymagane pola
      const newErrors: Record<string, string> = {};
      
      // Jeśli mamy jsonSchema, używamy go do walidacji
      if (jsonSchema && jsonSchema.properties) {
        const requiredFields = jsonSchema.required || [];
        
        Object.entries(jsonSchema.properties).forEach(([field, fieldSchema]: [string, any]) => {
          const isRequired = requiredFields.includes(field);
          const fieldValue = formData[field];
          
          if (isRequired && (fieldValue === undefined || fieldValue === '' || fieldValue === null)) {
            newErrors[field] = 'To pole jest wymagane';
          }
        });
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      onSubmit(formData);
    } catch (error: any) {
      console.error("Błąd walidacji:", error);
      setErrors({ _form: 'Wystąpił błąd walidacji formularza' });
    }
  };

  // Renderowanie pól formularza na podstawie schematu JSON
  const renderFields = () => {
    // Priorytetowo używamy jsonSchema
    if (jsonSchema && jsonSchema.properties) {
      return Object.entries(jsonSchema.properties).map(([field, fieldSchema]: [string, any]) => {
        const requiredFields = jsonSchema.required || [];
        const isRequired = requiredFields.includes(field);
        const fieldTitle = fieldSchema.title || field;
        const fieldType = fieldSchema.type || 'string';
        
        let inputType = "text";
        if (fieldType === 'number') {
          inputType = "number";
        } else if (fieldType === 'boolean') {
          inputType = "checkbox";
        }
        
        return (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {fieldTitle} {isRequired && <span className="text-red-500">*</span>}
            </label>
            
            {inputType === "text" && (
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
            
            {inputType === "number" && (
              <input
                type="number"
                value={formData[field] === undefined ? '' : formData[field]}
                onChange={(e) => handleChange(field, e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
            
            {inputType === "checkbox" && (
              <input
                type="checkbox"
                checked={formData[field] || false}
                onChange={(e) => handleChange(field, e.target.checked)}
                className={`mr-2 ${errors[field] ? 'border-red-500' : ''}`}
              />
            )}
            
            {errors[field] && (
              <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
          </div>
        );
      });
    }
    
    // Jeśli nie mamy właściwości, wyświetlamy informację
    return (
      <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
        <p>Brak zdefiniowanych pól w schemacie. Sprawdź konfigurację.</p>
        <pre className="mt-2 text-xs overflow-auto max-h-40">
          {JSON.stringify(jsonSchema || schema, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {props.title || 'Formularz'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {renderFields()}
        
        {errors._form && (
          <div className="my-4 p-3 bg-red-100 text-red-700 rounded">
            <p>{errors._form}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Dalej
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormStep;