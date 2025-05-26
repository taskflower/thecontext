// src/themes/default/widgets/SelectFieldWidget.tsx


interface SelectFieldWidgetProps {
  title?: string;
  attrs: {
    fieldKey: string;
    field: any;
    value: any;
    onChange: (key: string, value: any) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
  };
}

export default function SelectFieldWidget({ title, attrs }: SelectFieldWidgetProps) {
  const { fieldKey, field, value, onChange, required, disabled, placeholder, className } = attrs;
  
  const getSelectOptions = (enumVals: string[], field: any) =>
    enumVals.map((v) => ({ value: v, label: field.enumLabels?.[v] || v }));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">
        {title || field.label || fieldKey}
        {(required ?? field.required) && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        disabled={disabled}
        className={className || "w-full px-3 py-2 text-sm border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 bg-white"}
        required={required ?? field.required}
      >
        <option value="">{placeholder || "Wybierz opcję"}</option>
        {getSelectOptions(field.enum || [], field).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
      )}
    </div>
  );
}
