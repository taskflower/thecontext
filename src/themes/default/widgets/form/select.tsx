// src/themes/default/widgets/form/select.tsx - Modern Dropbox Style

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
    error?: string;
  };
}

export default function SelectFieldWidget({ title, attrs }: SelectFieldWidgetProps) {
  const { fieldKey, field, value, onChange, required, disabled, placeholder, className, error } = attrs;
  
  const getSelectOptions = (enumVals: string[], field: any) =>
    enumVals.map((v) => ({ value: v, label: field.enumLabels?.[v] || v }));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        {title || field.label || fieldKey}
        {(required ?? field.required) && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          disabled={disabled}
          className={
            className || 
            `w-full px-4 py-3 text-base border-2 rounded-xl transition-all duration-200 focus:outline-none bg-white appearance-none ${
              error 
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300'
            } ${
              disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'cursor-pointer'
            }`
          }
          required={required ?? field.required}
        >
          <option value="">{placeholder || "Choose an option..."}</option>
          {getSelectOptions(field.enum || [], field).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
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