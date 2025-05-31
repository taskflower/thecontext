// src/themes/default/widgets/form/text.tsx - Modern Dropbox Style

interface TextFieldWidgetProps {
  title?: string;
  attrs: {
    fieldKey: string;
    field: any;
    value: any;
    onChange: (key: string, value: any) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
  };
}

export default function TextFieldWidget({ title, attrs }: TextFieldWidgetProps) {
  const { fieldKey, field, value, onChange, placeholder, required, disabled, className, error } = attrs;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        {title || field.label || fieldKey}
        {(required ?? field.required) && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={placeholder || field.placeholder || `Enter ${(field.label || fieldKey).toLowerCase()}...`}
          disabled={disabled}
          className={
            className || 
            `w-full px-4 py-3 text-base border-2 rounded-xl transition-all duration-200 focus:outline-none ${
              error 
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300'
            } ${
              disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
            }`
          }
          required={required ?? field.required}
        />
        
        {/* Focus ring effect */}
        <div className="absolute inset-0 rounded-xl ring-0 ring-blue-500/20 transition-all duration-200 pointer-events-none group-focus-within:ring-4"></div>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {field.description && !error && (
        <p className="text-sm text-slate-500">{field.description}</p>
      )}
    </div>
  );
}