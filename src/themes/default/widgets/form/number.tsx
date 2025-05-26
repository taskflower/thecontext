// src/themes/default/widgets/NumberFieldWidget.tsx


interface NumberFieldWidgetProps {
  title?: string;
  attrs: {
    fieldKey: string;
    field: any;
    value: any;
    onChange: (key: string, value: any) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number | string;
    className?: string;
  };
}

export default function NumberFieldWidget({ title, attrs }: NumberFieldWidgetProps) {
  const { fieldKey, field, value, onChange, placeholder, required, disabled, min, max, step, className } = attrs;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">
        {title || field.label || fieldKey}
        {(required ?? field.required) && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={placeholder || field.placeholder}
        disabled={disabled}
        min={min ?? field.minimum}
        max={max ?? field.maximum}
        step={step ?? field.multipleOf ?? "any"}
        className={className || "w-full px-3 py-2 text-sm border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400"}
        required={required ?? field.required}
      />
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
      )}
    </div>
  );
}