/* eslint-disable @typescript-eslint/no-explicit-any */
// components/form/CustomFieldInput.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { IDocumentSchema } from '@/utils/containers/types';


interface CustomFieldInputProps {
  field: IDocumentSchema['fields'][0];
  value: any;
  onChange: (value: any) => void;
}

export const CustomFieldInput: React.FC<CustomFieldInputProps> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );
    default:
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );
  }
};