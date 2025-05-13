// src/core/hooks/useForm.ts
import { useState, useEffect } from "react";
import { ZodType } from "zod";

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
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const e = { ...prev };
      delete e[field];
      return e;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (jsonSchema?.properties) {
      (jsonSchema.required || []).forEach((field: string) => {
        const prop = jsonSchema.properties[field] || {};
        const val = formData[field];
        if (prop.type === "boolean") {
          if (val !== true) {
            newErrors[field] = "To pole jest wymagane";
          }
        } else if (val == null || val === "") {
          newErrors[field] = "To pole jest wymagane";
        }
      });
    }

    try {
      schema.parse(formData);
    } catch (e: any) {
      if (Array.isArray(e.errors)) {
        e.errors.forEach((err: any) => {
          const fieldPath = err.path.join(".");
          newErrors[fieldPath] = err.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialData || {});
    setErrors({});
  };

  return { formData, errors, handleChange, validateForm, resetForm };
};
