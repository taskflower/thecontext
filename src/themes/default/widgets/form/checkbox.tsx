// src/themes/default/widgets/CheckboxFieldWidget.tsx


interface CheckboxFieldWidgetProps {
  title?: string;
  attrs: {
    fieldKey: string;
    field: any;
    value: any;
    onChange: (key: string, value: any) => void;
    required?: boolean;
    disabled?: boolean;
    className?: string;
  };
}

export default function CheckboxFieldWidget({ title, attrs }: CheckboxFieldWidgetProps) {
  const { fieldKey, field, value, onChange, required, disabled, className } = attrs;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(fieldKey, e.target.checked)}
          disabled={disabled}
          className={className || "h-4 w-4 text-zinc-900 focus:ring-zinc-900/20 border-zinc-300 rounded"}
        />
        <label className="text-sm font-medium text-zinc-700">
          {title || field.label || fieldKey}
          {(required ?? field.required) && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
      )}
    </div>
  );
}