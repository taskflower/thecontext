// src/utils/documents/validation.ts
import { SchemaField } from "@/types/schema";


export const validateField = (value: unknown, field: SchemaField): boolean => {
  // Handle required field validation
  if (field.validation?.required && (value === undefined || value === null || value === "")) {
    return false;
  }

  // Handle optional fields that are empty
  if (!field.validation?.required && (value === undefined || value === null || value === "")) {
    return true;
  }

  try {
    switch (field.type) {
      case 'string': {
        if (typeof value !== 'string') {
          return false;
        }
        
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return false;
        }
        
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return false;
        }
        
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          return false;
        }
        
        return true;
      }

      case 'number': {
        let numValue: number;
        if (typeof value === 'string') {
          numValue = Number(value);
        } else if (typeof value === 'number') {
          numValue = value;
        } else {
          return false;
        }

        if (isNaN(numValue)) {
          return false;
        }
        
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          return false;
        }
        
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          return false;
        }
        
        return true;
      }

      case 'date': {
        let dateValue: Date;
        
        if (value instanceof Date) {
          dateValue = value;
        } else if (typeof value === 'string') {
          dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            return false;
          }
        } else {
          return false;
        }
        
        if (field.validation?.minDate && dateValue < new Date(field.validation.minDate)) {
          return false;
        }
        
        if (field.validation?.maxDate && dateValue > new Date(field.validation.maxDate)) {
          return false;
        }
        
        return true;
      }

      case 'boolean': {
        if (typeof value === 'boolean') {
          return true;
        }
        if (value === 'true' || value === 'false') {
          return true;
        }
        return false;
      }

      case 'select': {
        if (!field.validation?.options?.length) {
          return false;
        }
        return field.validation.options.includes(value as string);
      }

      default:
        return false;
    }
  } catch (error) {
    console.error("Error validating field:", error);
    return false;
  }
};