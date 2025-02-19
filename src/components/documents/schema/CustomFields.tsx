/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/documents/schema/CustomFields.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { SchemaField } from '@/types/schema';
import { Trans } from "@lingui/macro";

interface CustomFieldsProps {
  schema: SchemaField[];
  document: Record<string, any>;
  onUpdate: (field: string, value: unknown) => void;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({ 
  schema, 
  document,
  onUpdate
}) => {
  // Pobieramy wartość custom pola – sprawdzamy zarówno główny poziom, jak i document.customFields
  const getFieldValue = (field: SchemaField, defaultValue: unknown = '') => {
    return document[field.key] ?? document.customFields?.[field.key] ?? defaultValue;
  };

  const renderField = (field: SchemaField) => {
    const rawKey = field.key;
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={getFieldValue(field, '') as string}
            onChange={e => onUpdate(rawKey, e.target.value)}
            placeholder={field.name}
            required={field.validation?.required}
          />
        );
      // Dodaj obsługę innych typów pól, jeśli potrzebujesz
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium"><Trans>Custom Fields</Trans></h3>
      <div className="space-y-4">
        {schema.map(field => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.validation?.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFields;
