// src/shared/components/FormField.tsx
import React from 'react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{value: string, label: string}>;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label, type = 'text', value, onChange, options, placeholder, required, rows = 2
}) => {
  const baseClass = "w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} 
          rows={rows} className={baseClass} placeholder={placeholder} />
      ) : type === 'select' ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} 
          className={baseClass} placeholder={placeholder} />
      )}
    </div>
  );
};