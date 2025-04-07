// components/ui/FormField.tsx
import React, { ChangeEvent } from "react";

interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  rows = 0,
  hint = "",
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1" htmlFor={name}>
      {label}
    </label>
    {rows > 0 ? (
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
        rows={rows}
        required={required}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
        required={required}
      />
    )}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);
