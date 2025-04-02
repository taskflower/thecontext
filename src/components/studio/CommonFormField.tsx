import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}

export const InputField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

interface TextAreaFieldProps extends FormFieldProps {
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}) => {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        id={id}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// Color picker component
export const ColorField: React.FC<{
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, name, label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="h-8 w-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="flex-1 px-2 py-1 text-sm rounded border border-input bg-transparent"
        />
      </div>
    </div>
  );
};

// Checkbox field component
export const CheckboxField: React.FC<{
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}> = ({ id, name, label, checked, onChange, description }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-primary text-primary focus:ring-1 focus:ring-ring focus:ring-offset-1"
        />
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground pl-6">{description}</p>
      )}
    </div>
  );
};

// Select field component
export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  description
}) => {
  return (
    <div className="space-y-2 my-4">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
};
