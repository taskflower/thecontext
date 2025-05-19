// src/themes/default/commons/form/FormikField.tsx
import React from 'react';
import { FormikProps } from 'formik';

interface FieldSchema {
  fieldType: string;
  title: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  isArray?: boolean;
}

interface FormikFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
}

const FormikField: React.FC<FormikFieldProps> = ({
  name,
  formik,
  fieldSchema,
  nodeSlug,
}) => {
  const { 
    title, 
    required, 
    description, 
    placeholder, 
    fieldType,
    options,
    min,
    max,
    step
  } = fieldSchema;
  
  const value = formik.values[name];
  const error = formik.touched[name] && formik.errors[name];
  const fieldId = `field-${nodeSlug}-${name}`;
  
  const handleChange = (value: any) => {
    formik.setFieldValue(name, value);
  };
  
  const commonProps = {
    id: fieldId,
    name,
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    className: "w-full bg-transparent text-sm focus:outline-none",
    placeholder,
  };
  
  // Renderowanie pola w zależności od typu
  const renderField = () => {
    switch (fieldType) {
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={fieldId}
              name={name}
              checked={value || false}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
              {placeholder || "Zaznacz"}
            </label>
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value || ""}
            rows={4}
            className="w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus:outline-none text-sm"
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            value={value || ""}
            className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
          >
            <option value="">-- Wybierz --</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type="number"
              {...commonProps}
              value={value === undefined ? "" : value}
              min={min}
              max={max}
              step={step}
            />
          </div>
        );
      
      case 'tags':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(value) && value.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const newTags = (value || []).filter((t: string) => t !== tag);
                      handleChange(newTags);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const currentTags = Array.isArray(value) ? value : [];
                    if (!currentTags.includes(e.target.value)) {
                      handleChange([...currentTags, e.target.value]);
                    }
                    e.target.value = "";
                  }
                }}
                className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
              >
                <option value="">-- Wybierz --</option>
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      // Domyślny przypadek - pole tekstowe
      default:
        return (
          <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
            <input
              type={fieldType === 'email' ? 'email' : fieldType === 'date' ? 'date' : 'text'}
              {...commonProps}
              value={value || ""}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="my-4 space-y-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && <p className="text-sm text-gray-500">{description}</p>}
      
      {renderField()}
      
      {error && <p className="text-red-500 text-xs">{String(error)}</p>}
    </div>
  );
};

export default FormikField;