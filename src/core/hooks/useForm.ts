// src/core/hooks/useForm.ts
import { useState, useEffect } from 'react';
import { ZodType } from 'zod';

interface UseFormOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  initialData?: T;
}

interface UseFormResult<T> {
  formData: Record<string, any>;
  errors: Record<string, string>;
  handleChange: (field: string, value: any) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

export const useForm = <T>({
  schema,
  jsonSchema,
  initialData,
}: UseFormOptions<T>): UseFormResult<T> => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Aktualizuj dane formularza, gdy zmienią się initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Obsługa zmiany wartości pola
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

  // Walidacja formularza
  const validateForm = (): boolean => {
    try {
      // Prosta walidacja - sprawdź wymagane pola
      const newErrors: Record<string, string> = {};
      
      // Jeśli mamy jsonSchema, używamy go do walidacji
      if (jsonSchema && jsonSchema.properties) {
        const requiredFields = jsonSchema.required || [];
        
        Object.entries(jsonSchema.properties).forEach(([field]: [string, any]) => {
          const isRequired = requiredFields.includes(field);
          const fieldValue = formData[field];
          
          if (isRequired && (fieldValue === undefined || fieldValue === '' || fieldValue === null)) {
            newErrors[field] = 'To pole jest wymagane';
          }
        });
      }
      
      // Jeśli mamy schemat Zod, używamy go również do walidacji
      if (schema) {
        try {
          schema.parse(formData);
        } catch (zodError: any) {
          // Obsługa błędów z Zod (konwersja do formatu naszych błędów)
          if (zodError.errors) {
            zodError.errors.forEach((err: any) => {
              const path = err.path.join('.');
              newErrors[path] = err.message;
            });
          }
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error: any) {
      console.error("Błąd walidacji:", error);
      setErrors({ _form: 'Wystąpił błąd walidacji formularza' });
      return false;
    }
  };

  // Resetowanie formularza
  const resetForm = () => {
    setFormData(initialData || {});
    setErrors({});
  };

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm
  };
};