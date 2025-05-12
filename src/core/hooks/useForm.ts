// src/core/hooks/useForm.ts
import { useState, useEffect } from 'react';
import { ZodType } from 'zod';

interface UseFormOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  initialData?: T;
}

interface UseFormResult {
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
}: UseFormOptions<T>): UseFormResult => {
  // Dodany log debugujący
  console.log('[useForm] Called with params:', { 
    schema: schema ? 'ZodSchema present' : 'No ZodSchema', 
    jsonSchema: jsonSchema || 'No jsonSchema', 
    initialData: initialData || 'No initialData' 
  });
  
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      console.log('[useForm] Setting initial data:', initialData);
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    console.log(`[useForm] Field change: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validateForm = (): boolean => {
    console.log('[useForm] Validating form, current data:', formData);
    const newErrors: Record<string, string> = {};

    // JSON Schema
    if (jsonSchema?.properties) {
      console.log('[useForm] Validating with JSON Schema:', jsonSchema);
      console.log('[useForm] Required fields:', jsonSchema.required || []);
      
      (jsonSchema.required || []).forEach((field: string) => {
        const prop = jsonSchema.properties[field] || {};
        const val = formData[field];
        console.log(`[useForm] Validating required field: ${field}, value:`, val, 'property:', prop);
        
        if (prop.type === 'boolean') {
          if (val !== true) {
            console.log(`[useForm] Boolean field ${field} validation failed: value is not true`);
            newErrors[field] = 'To pole jest wymagane';
          }
        } else if (val == null || val === '') {
          console.log(`[useForm] Field ${field} validation failed: value is null or empty`);
          newErrors[field] = 'To pole jest wymagane';
        }
      });
    }

    // Zod
    try {
      console.log('[useForm] Validating with Zod schema');
      schema.parse(formData);
    } catch (e: any) {
      console.log('[useForm] Zod validation error:', e);
      if (Array.isArray(e.errors)) {
        e.errors.forEach((err: any) => {
          const fieldPath = err.path.join('.');
          console.log(`[useForm] Zod error for field ${fieldPath}:`, err.message);
          newErrors[fieldPath] = err.message;
        });
      }
    }

    console.log('[useForm] Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    console.log('[useForm] Resetting form');
    setFormData(initialData || {});
    setErrors({});
  };

  return { formData, errors, handleChange, validateForm, resetForm };
};