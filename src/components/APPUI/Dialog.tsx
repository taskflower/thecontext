// components/ui/Dialog.tsx
import React, { ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { DialogField, FormData } from '@/modules/modules';

interface DialogProps {
  title: string;
  onClose: () => void;
  onAdd: () => void;
  fields: DialogField[];
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Dialog: React.FC<DialogProps> = ({ 
  title, onClose, onAdd, fields, formData, onChange 
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid gap-3 py-3">
          {fields.map(field => 
            field.type === 'select' ? (
              <select
                key={field.name}
                name={field.name}
                value={String(formData[field.name] || '')}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select {field.placeholder} --</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                name={field.name}
                value={String(formData[field.name] || '')}
                onChange={onChange}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          )}
          <button 
            onClick={onAdd}
            className="py-1 px-2 text-xs rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
);